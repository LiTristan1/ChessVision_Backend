import express, {} from 'express';
import { deleteGameTable, updateGameTable, updateStatsTable, createUserTable, createSessionTable, createOpeningTable, createPWResetsTable, createEmailConfirmationTable, createPendingUsersTable } from '../controllers/databaseController.js';
const router = express.Router();
router.patch('/updateEntireDB', (req, res) => {
    updateGameTable(req, res);
});
router.patch(`/updateStatsTable`, (req, res) => {
    updateStatsTable(req, res);
});
router.delete('/deleteGamesDB', (req, res) => {
    deleteGameTable(req, res);
});
router.put('/createSessionTable', (req, res) => {
    createSessionTable(req, res);
});
router.put('/createPasswordResetTable', (req, res) => {
    createPWResetsTable(req, res);
});
router.put('/createUsersTable', (req, res) => {
    createUserTable(req, res);
});
router.put('/createPendingUsersTable', (req, res) => {
    createPendingUsersTable(req, res);
});
router.put('/createOpeningsTable', (req, res) => {
    createOpeningTable(req, res);
});
router.put('/createEmailConfirmationTable', (req, res) => {
    createEmailConfirmationTable(req, res);
});
export default router;
