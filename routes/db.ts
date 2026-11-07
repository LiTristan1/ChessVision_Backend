import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import { deleteGameTable, updateGameTable, updateStatsTable, createUserTable, createSessionTable, createOpeningTable, createPWResetsTable, createEmailConfirmationTable, createPendingUsersTable } from '../controllers/databaseController.ts'
const router = express.Router()


router.patch('/updateEntireDB', (req: Request, res: Response) => {
    updateGameTable(req, res)
})

router.patch(`/updateStatsTable`, (req: Request, res: Response) => {
    updateStatsTable(req, res)
})
router.delete('/deleteGamesDB', (req: Request, res: Response) => {
    deleteGameTable(req, res);
})
router.put('/createSessionTable', (req: Request, res: Response) => {
    createSessionTable(req, res)
})
router.put('/createPasswordResetTable', (req: Request, res: Response) => {
    createPWResetsTable(req, res)
})

router.put('/createUsersTable', (req: Request, res: Response) => {
    createUserTable(req, res)
})
router.put('/createPendingUsersTable', (req: Request, res: Response) => {
    createPendingUsersTable(req, res)
})
router.put('/createOpeningsTable', (req: Request, res: Response) => {
    createOpeningTable(req, res)
})
router.put('/createEmailConfirmationTable', (req: Request, res: Response) => {
    createEmailConfirmationTable(req, res)
})



export default router