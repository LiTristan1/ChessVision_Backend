import express, { type Request, type Response, type NextFunction } from 'express'
import { createAuthTokens } from '../controllers/sessionController.ts'
const router = express.Router()



export default router
