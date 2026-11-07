import express, {} from 'express';
import { getGamesByYear, getMasterGamesByPosition, getOTBStatsOfPosition, getFullGameAnalysis, getAllOpenings, getGameById } from '../controllers/gameController.js';
import {} from '../middleware/jwt.js';
import db from '../database/postgresConnection.js';
const base_url = "https://api.chess.com/pub/";
const router = express.Router();
const timeMiddleWare = (req, res, next) => {
    console.log("Time accessing game route:" + Date.now());
    next();
};
router.use(timeMiddleWare);
router.get("/:year", async (req, res) => {
    const userName = req.user?.username;
    const year = req.params.year;
    const foundUser = await db.query(`SELECT chess_com_username FROM users WHERE username = $1 LIMIT 1`, [userName]);
    console.log(`Received username and year ${userName} and ${year}`);
    if (!foundUser) {
        return res.status(404).json({
            "message": "User not found!"
        });
    }
    if (!userName) {
        return res.status(401).json({
            message: "User not authenticated"
        });
    }
    if (typeof year !== "string") {
        return res.status(400).json({
            message: "Year query parameter is required"
        });
    }
    const data = await getGamesByYear(foundUser[0].chess_com_username, year);
    // console.log(`Received Data ${JSON.stringify(data)}`);
    return res.json(data);
});
router.get("/position", async (req, res) => {
    const position = req.body.position;
    if (!position) {
        return res.json(404).json({ "message": "Non empty position must be provided" });
    }
    const data = await getMasterGamesByPosition(req, res, position);
    return res.json(data);
});
router.get("/OTBpositionStats", async (req, res) => {
    const position = req.body.position;
    console.log("Inside position stats");
    if (!position || position == undefined) {
        return res.json(404).json({ "message": "Non empty position must be provided" });
    }
    const data = await getOTBStatsOfPosition(req, res, position);
    return res.status(200).json(data);
});
router.get("/openings/variations", async (req, res) => {
    console.log("Matched inside /openings");
    const data = await getAllOpenings(req, res);
    return res.status(200).json(data);
});
router.get("/game/:id", async (req, res) => {
    console.log("Getting specific game");
    if (!req.params) {
        console.log("Missing params");
        return res.status(404).json({ "message": "Missing ID" });
    }
    const id = req.params.id;
    if (!id) {
        console.log("Missing id!");
        return res.status(404).json({ "message": "Missing ID" });
    }
    if (typeof (id) !== "string") {
        return res.status(400).json({ "message": "Id must be a string" });
    }
    const data = await getGameById(req, res, id);
    return res.status(200).json(data[0]);
});
router.post("/fullAnalysis", async (req, res) => {
    const analysisInput = req.body;
    const analysis = await getFullGameAnalysis(req, res, analysisInput);
    return res.status(200).json(analysis);
});
export default router;
