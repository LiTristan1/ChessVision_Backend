import jwt, {
    type JwtPayload,
    type SignOptions,
    type VerifyOptions,
    type Secret
} from "jsonwebtoken"
import dotenv from 'dotenv'
import db from '../database/postgresConnection.ts'
import { v4 as uuidv4 } from 'uuid';
dotenv.config()
import { type Request, type Response } from 'express'
export async function createAuthTokens(username: string, userId: string, res: Response) {
    //create jwt

    //make a test to make the accessToken expire 10s
    try {

        //need to find if the user even exists in the db

        //create tokens
        const accessToken = jwt.sign({ username }, process.env.ACCESS_TOKEN_SECRET!, { algorithm: 'HS256', expiresIn: '45s' })
        const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET!, { algorithm: 'HS256', expiresIn: '1d' })


        //first delete any token under that user
        await db.query(`DELETE FROM sessions WHERE user_id=$1`, [userId])
        //then store the access and refresh tokens into the table
        await db.query(`INSERT INTO sessions(id, user_id, access_token, refresh_token) VALUES($1, $2, $3, $4)`, [uuidv4(), userId, accessToken, refreshToken])

        // Make new tokens available to the frontend
        res.setHeader("X-Access-Token", accessToken);
        res.setHeader("X-Refresh-Token", refreshToken);



    } catch (e) {
        console.log(`Error creating access and/or refresh tokens: ${e}`)
    }

}

export function createRefreshToken() {

}
//TODO: Refresh a user session
export function refreshAccessToken() {

}
//TODO: Expire a user session
export function expireSession() {

}

