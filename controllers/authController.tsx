import { type Request, type Response } from "express"
import db from '../database/postgresConnection.ts'
import { v4 as uuidv4 } from 'uuid';
import { createAuthTokens } from "./sessionController.ts";
import bcrypt from "bcrypt"
import dotenv from 'dotenv'
import crypto from 'crypto'
import Email from "../emails/Email.tsx";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { AuthRequest } from "../middleware/jwt.ts";
import type { UserCheck } from "../types/gameType.ts";
import ActivationEmail from "../emails/EmailActivationTemplate.tsx";
dotenv.config()

//migrate this to pendingUsers Table
export async function createUser(req: Request, res: Response) {

    const username = req.body.username
    const password = req.body.password
    const chess_com_username = req.body.chess_com_username
    const email = req.body.email

    console.log(`Inside create user received values: username: ${username} password: ${password} email: ${email} chess.com: ${chess_com_username}`)
    if (!username || !password) {
        return res.status(404).json({ "message": `Both username and password must be provided` })
    }

    try {
        const chess_com_base_url = process.env.CHESS_COM_BASE_URL
        const response = await fetch(`${chess_com_base_url}/player/${chess_com_username}/games/archives`)
        if (response.status === 404) {
            return res.status(404).json({ "message": "Chess.com user not found" })
        }

        if (!response.ok) {
            return res.status(502).json({
                message: "Unable to verify Chess.com username"
            });
        }

    } catch (e) {
        console.log("Unable to find chess.com username")
        return res.status(502).json({
            message: "Unable to verify Chess.com username"
        });
    }
    console.log("Received username", username)
    //check if there are duplicate users in USERS TABLE
    const result = await db.query(`
        SELECT username,email FROM USERS WHERE username = $1 OR email = $2
        `, [username, email])
    //check if there are duplicate users in PENDINGUSERS TABLE
    const result1 = await db.query(`SELECT username,email FROM PENDINGUSERS WHERE username = $1 OR email = $2
`, [username, email])
    console.log("Requested username:", JSON.stringify(username));
    console.log("Requested email:", JSON.stringify(email));

    console.log("USERS result:", JSON.stringify(result));
    console.log("PENDINGUSERS result:", JSON.stringify(result1));

    if (result.some((user: UserCheck) => user.username === username) || result1.some((user: UserCheck) => user.username === username)) {
        return res.status(409).json({
            message: "Username already exists."
        })
    }

    if (result.some((user: UserCheck) => user.email === email) || result1.some((user: UserCheck) => user.email === email)) {
        return res.status(409).json({
            message: "Email already registered."
        })
    }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            console.log("Error generating salt: " + err)
            return res.status(500).json({ "message": `Error generating salt for password ${err}` })
        } else {

            bcrypt.hash(password, salt, async function (err, hash) {
                //store hash in the password db
                if (err) {
                    console.log("Error generating hash: " + err)
                    return res.status(500).json({ "message": `Error generating hash for password ${err}` })

                }

                const id = uuidv4()
                try {
                    //first insert into the pending users table
                    await db.query(`
                    INSERT INTO PENDINGUSERS(
                        id,
                        username,
                        password,
                        email,
                        chess_com_username
                    )
                        VALUES($1, $2, $3, $4,$5)
                    
                `, [id, username, hash, email, chess_com_username])


                    await confirmEmail(req, res, username, email, id)
                    return res.sendStatus(200)

                } catch (e) {
                    console.log("Error storing new user into db: " + e)
                    return res.status(500).json({ "message": `Error storing new user into database ${e}` })
                }
            })
        }
    })

}

export async function confirmUser(req: Request, res: Response) {
    //TODO move user from pendingUsers to users table
    console.log("Inside confirm user");
    if (!req.body || !req.body.token) {
        return res.status(404).json({ "message": "Body must contain confirmation token" })
    }
    const token = req.body.token
    try {


        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        console.log("Hashed token value: " + hashedToken)
        //create SQL transaction
        await db.tx(async (t) => {
            const foundRequest = await t.query(`SELECT * FROM EMAILCONFIRMATION WHERE token_hash = $1 AND expires_at > NOW() LIMIT 1 FOR UPDATE`, [hashedToken])



            //if can't find request
            if (foundRequest.length == 0) {
                throw new Error("Unable to find confirmation request")
            }

            //find the user that this links to
            const foundPendingUser = await t.query(`SELECT * FROM PENDINGUSERS WHERE id = $1 LIMIT 1 FOR UPDATE`, [foundRequest[0].pending_user_id])

            if (foundPendingUser.length == 0) {
                throw new Error("Unable to find pending user related to confirmation request")

            }
            //if found request
            //move the user from pendingUsers to Users Table
            const insertIntoUsers = await t.query(`INSERT INTO USERS(id,username, email, password, chess_com_username) VALUES($1,$2,$3,$4,$5)`, [foundPendingUser[0].id, foundPendingUser[0].username, foundPendingUser[0].email, foundPendingUser[0].password, foundPendingUser[0].chess_com_username])

            //delete from pendingUsers
            const deleteFromPendingUsers = await t.query(`DELETE FROM PENDINGUSERS WHERE id = $1`, [foundPendingUser[0].id])
        })
        return res.status(200).json({
            message: "Email successfully verified"
        });

    } catch (e) {
        console.log("Confirm user error: " + e)
        return res.status(500).json({ "message": `Error moving user from PENDINGUSERS to USERS table: ${e}` })
    }
}

export async function confirmEmail(req: Request, res: Response, username: string, email: string, userId: string) {

    try {
        const token = await crypto.randomBytes(64).toString('hex')
        const hashedToken = await crypto.createHash('sha256').update(token).digest('hex')
        const resendAPIKey = process.env.RESEND_API_KEY
        const resend = new Resend(resendAPIKey)
        //insert hashedToken into db

        //first delete any confirmation emails for that user id
        const deleteAllPreviousConfirmations = await db.query(`DELETE FROM EMAILCONFIRMATION WHERE pending_user_id = $1`, [userId])
        //insert into email confirmation table
        const insertIntoEmailConfirmation = await db.query(`INSERT INTO EMAILCONFIRMATION(
                pending_user_id,
                token_hash,
                created_at,
                expires_at
            ) VALUES($1, $2, NOW(), NOW() + INTERVAL '1 day')`, [userId, hashedToken])
        const { data, error } = await resend.emails.send({
            from: "ChessVision <noreply@tristanli.com>",
            to: email,
            subject: "Activate Account",
            react: <ActivationEmail url={`https://tristanli.com/emailActivation?token=${encodeURIComponent(token)}`} />
        })

    } catch (e) {
        console.log("Error sending confirmation email: " + e)
        throw e
    }
}

export async function login(req: Request, res: Response) {

    if (!req.body) {
        return res.status(422).json({ "message": "Missing request body" })
    }
    const username = req.body.username
    const password = req.body.password
    console.log(`Received body username : ${username} password: ${password}`)
    if (!username || !password) {
        return res.status(404).json({ "message": "Request must have username and password " })

    }
    try {
        //get the hashed password
        const foundUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username])
        if (foundUser.length == 0) {
            return res.status(404).json({ "message": "User not found" })
        }
        const foundUserPassword = foundUser[0].password

        //use bcrypt to decode the password
        bcrypt.compare(password, foundUserPassword, async function (err, result) {
            if (err) {
                return res.status(403).json({ "message": `Error processing password hash: ${err}` })
            }

            if (result === true) {
                //create accessTokens
                const tokens = await createAuthTokens(foundUser[0].username, foundUser[0].id, res)
                console.log("Set headers", res.getHeaders())
                return res.sendStatus(200)
            } else {
                return res.sendStatus(403)
            }
        })

    } catch (e) {
        return res.status(500).json({ "message": "Error decoding password" })
    }
}


//TO DO
export async function logout(req: Request, res: Response) {
    try {
        //get user id

        if (!req.body || !req.body.username) {
            return res.status(404).json({ "message": "missing body or username" })
        }

        const username = req.body.username
        const userIdQuery = await db.query('SELECT id FROM users WHERE username = $1', [username])

        const id = userIdQuery[0].id

        const response = await db.query(`DELETE FROM sessions WHERE id = $1`, [id])

        return res.sendStatus(200)
    } catch (e) {
        console.log("Error logging out")
        return res.status(500).json({ "message": `Error logging out: ${e}` })
    }
}



export async function sendResetPasswordLink(req: Request, res: Response) {
    console.log("Hit resetPassword")
    if (!req.body || !req.body.email) {
        return res.status(404).json({ "message": "Missing email" })
    }
    const email = req.body.email
    try {
        const token = crypto.randomBytes(64).toString("hex")
        const randomHash = crypto.createHash('sha256').update(token).digest("hex")

        const user_id = await db.query(`SELECT id from users WHERE email = $1 LIMIT 1`, [email])

        if (user_id.length == 0) {
            return res.status(404).json({ "message": `User with email ${email} not found.` })
        }
        //store hashed token into resetPassword

        await db.query(`INSERT INTO PWRESETS(user_id, token_hash, created_at,expires_at ) VALUES(
            $1, $2, NOW(), NOW() + INTERVAL '15 minutes'
            )`, [user_id[0].id, randomHash])
        //send the email to the user 
        const resendAPIKey = process.env.RESEND_API_KEY
        const resend = new Resend(resendAPIKey)
        console.log("Used resend api key: " + resend)
        const referralUrl = `chessvision://resetPassword?token=${encodeURIComponent(token)}`; console.log("Using url: " + referralUrl)
        const { data, error } = await resend.emails.send({
            from: "ChessVision <noreply@tristanli.com>",
            to: email,
            subject: "password reset",
            react: <Email url={`https://tristanli.com/resetPassword?token=${encodeURIComponent(token)}`} />
        })

        if (error) {
            console.log("Error with sending email: " + email)
        }

        return res.sendStatus(200);

    } catch (e) {
        console.log("Error generating hash: " + e)
        return res.status(500).json({ "message": `Error generating resetPassword hash: ${e}` })
    }


}

export async function resetPassword(req: Request, res: Response) {
    console.log("Inside resetPassword controller")
    if (!req.body) {
        return res.status(404).json({ "message": "Missing request body" })
    }
    if (!req.body.token) {
        return res.status(404).json({ "message": "Missing token" })
    }
    if (!req.body.newPassword) {
        return res.status(404).json({ "message": "Missing new Password" })
    }

    const token = req.body.token
    const newPassword = req.body.newPassword
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const foundResetRequest = await db.query('SELECT * FROM PWRESETS WHERE token_hash = $1 LIMIT 1', [hashedToken])

        if (!foundResetRequest) {

            return res.status(404).json({ "message": "Unable to identify reset request" })
        }

        console.log("Found reset request: " + JSON.stringify(foundResetRequest))
        const newDate = new Date()
        if (newDate > foundResetRequest.expired_at) {
            return res.status(410).json({ "message": "Request expired, please request to reset password again" })
        }
        const user_id = foundResetRequest[0].user_id
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                console.log("Error generating salt: " + err)
                return res.status(500).json({ "message": `Error generating salt for password ${err}` })
            } else {
                bcrypt.hash(newPassword, salt, async function (err, hash) {
                    //store hash in the password db
                    if (err) {
                        console.log("Error generating hash: " + err)
                        return res.status(500).json({ "message": `Error generating hash for password ${err}` })

                    }
                    try {
                        console.log("Updating db with new password")
                        const updateDB = await db.query(`UPDATE users SET password = $1 WHERE id = $2`, [hash, user_id])
                        //delete the request from the db 
                        const deleteRequest = await db.query(`DELETE FROM PWRESETS WHERE id = $1`, [foundResetRequest.id])
                        return res.sendStatus(200)

                    } catch (e) {
                        console.log("Error updating user password into db: " + e)
                        return res.status(500).json({ "message": `Error updating user ${foundResetRequest[0].user_id} password into db: ${e}` })
                    }
                })
            }
        })


    } catch (e) {
        console.log("error resetting password: " + e)
    }
}
//



