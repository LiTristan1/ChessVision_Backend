import express, { type Request, type Response, type NextFunction } from 'express'
import { createUser, login, sendResetPasswordLink, logout, resetPassword, confirmUser } from '../controllers/authController.tsx'

const router = express.Router()

router.post('/register', (req: Request, res: Response) => {
    createUser(req, res)
})
router.post('/confirmUser', (req: Request, res: Response) => {
    confirmUser(req, res)
})
router.post('/auth', (req: Request, res: Response) => {

})
router.post('/login', (req: Request, res: Response) => {
    login(req, res)
})

router.post(`/sendResetPasswordLink`, (req: Request, res: Response) => {
    sendResetPasswordLink(req, res)
})
router.post(`/resetPassword`, (req: Request, res: Response) => {
    resetPassword(req, res)
})
router.post('/logout', (req: Request, res: Response) => {
    logout(req, res)
})



export default router

