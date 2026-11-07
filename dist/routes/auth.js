import express, {} from 'express';
import { createUser, login, sendResetPasswordLink, logout, resetPassword, confirmUser } from '../controllers/authController.js';
const router = express.Router();
router.post('/register', (req, res) => {
    createUser(req, res);
});
router.post('/confirmUser', (req, res) => {
    confirmUser(req, res);
});
router.post('/auth', (req, res) => {
});
router.post('/login', (req, res) => {
    login(req, res);
});
router.post(`/sendResetPasswordLink`, (req, res) => {
    sendResetPasswordLink(req, res);
});
router.post(`/resetPassword`, (req, res) => {
    resetPassword(req, res);
});
router.post('/logout', (req, res) => {
    logout(req, res);
});
export default router;
