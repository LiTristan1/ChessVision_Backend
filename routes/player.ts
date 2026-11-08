import { Router } from "express";
import { type Request, type Response } from 'express'
import { deleteAccount, getChessVisionUserInfo, getPlayerProfile, getPlayerStats, updateUserInfo } from "../controllers/playerController.ts";
import { type AuthRequest } from "../middleware/jwt.ts";
import db from "../database/postgresConnection.ts";
const router = Router()


router.get('/', async (req: AuthRequest, res: Response) => {
    try {


        const userName = req.user?.username
        const foundUser = await db.query(`SELECT chess_com_username FROM users WHERE username = $1 LIMIT 1`, [userName])

        if (foundUser.length == 0) {
            return res.status(404).send({ "message: ": "Can not find username" })
        }

        const data = await getPlayerProfile(foundUser[0].username);
        return res.json(data)
    } catch (e) {
        console.log("Error fetching user profile: " + e)
    }
})

router.get('/stats', async (req: AuthRequest, res: Response) => {
    try {
        const userName = req.user?.username
        const foundUser = await db.query(`SELECT chess_com_username FROM users WHERE username = $1 LIMIT 1`, [userName])

        if (foundUser.length == 0) {
            return res.status(404).send({ "message: ": "Can not find username" })
        }

        const data = await getPlayerStats(foundUser[0].chess_com_username);

        return res.json(data)

    } catch (e) {
        console.log("Error retrieving user stats: " + e)
    }
})

router.get('/fullProfile', async (req: AuthRequest, res: Response) => {
    try {
        const userName = req.user?.username

        const foundUser = await db.query(`SELECT chess_com_username FROM users WHERE username = $1 LIMIT 1`, [userName])


        if (foundUser.length == 0) {
            return res.status(404).send({ "message: ": "Can not find username" })
        }

        const profile = await getPlayerProfile(foundUser[0].chess_com_username)
        const stats = await getPlayerStats(foundUser[0].chess_com_username);

        console.log("Retrieved profile: " + JSON.stringify(profile))
        console.log("Retrieved Stats: " + JSON.stringify(stats))

        return res.json({ profile: profile, stats: stats }).status(200)

    } catch (e) {
        console.log("Error retrieving full profile: " + e)
        return res.status(500).json({ "message": `Error getting full profile: ${e}` })
    }

})

router.get('/chessVisionInfo', async (req: AuthRequest, res: Response) => {
    console.log("hit it broski #1")
    try {
        const username = req.user?.username
        if (!username) {
            return res.status(404).send({ "message: ": "Can not find username" })
        }

        const chessVisionRes = await getChessVisionUserInfo(username)

        if (chessVisionRes == null) {
            return res.status(404).json({ "message": `The requested user with username ${username} is not found` })
        }

        return res.status(200).json(chessVisionRes)
    } catch (e) {
        console.log("Error retrieving chess vision info: " + e)
        return res.status(500).json({ "message": `Error getting chessVisionInfo: ${e}` })
    }
})

router.patch('/update', async (req: Request, res: Response) => {
    console.log("hit update player")
    await updateUserInfo(req, res);
})

router.delete('/account', async (req: AuthRequest, res: Response) => {
    console.log("Hit delete user")
    await deleteAccount(req, res)
})

export default router;