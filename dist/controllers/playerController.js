import { stripTypeScriptTypes } from "node:module";
import {} from "express";
import { createAuthTokens } from "./sessionController.js";
import {} from "../middleware/jwt.js";
import db from "../database/postgresConnection.js";
const base_url = "https://api.chess.com/pub";
export async function getPlayerProfile(chessComUsername) {
    //we want to also get the player status
    try {
        const response = await fetch(`${base_url}/player/${chessComUsername}`);
        const response_json = await response.json();
        return response_json;
    }
    catch (err) {
        console.log("Error fetching profile component: " + err);
    }
}
export async function getPlayerStats(chessComUsername) {
    try {
        const response = await fetch(`${base_url}/player/${chessComUsername}/stats`);
        const response_json = await response.json();
        return response_json;
    }
    catch (err) {
        console.log("Error fetching stats component: " + err);
    }
}
export async function getChessVisionUserInfo(username) {
    console.log("Hit it broski!");
    try {
        const response = await db.query(`SELECT username, email,chess_com_username FROM users WHERE username = $1 LIMIT 1`, [username]);
        if (response.length == 0) {
            return null;
        }
        const userResponse = {
            username: response[0].username,
            email: response[0].email,
            chessComUsername: response[0].chess_com_username
        };
        console.log("user response: " + JSON.stringify(userResponse));
        return userResponse;
    }
    catch (e) {
        console.log("Error fetching chess vision user info: " + e);
    }
}
export async function updateUserInfo(req, res) {
    console.log("Hit update user info");
    if (!req.body) {
        return res.status(200).json({ "message": "Empty Body Received" });
    }
    const queryUsername = req.user?.username;
    const { username, email, chess_com_username } = req.body;
    try {
        //make sure user even exists
        const foundUser = await db.query(`SELECT * FROM users WHERE username = $1 LIMIT 1`, [queryUsername]);
        console.log("Found user:", foundUser);
        console.log("Authenticated username:", queryUsername);
        if (foundUser.length == 0) {
            return res.status(404).json({ "message": `User with username ${queryUsername} not found` });
        }
        const response = await db.query(`UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email), chess_com_username = COALESCE($3, chess_com_username) WHERE username = $4 RETURNING id, username, email, chess_com_username`, [username, email, chess_com_username, queryUsername]);
        //we will need to return new tokens 
        console.log("Updating response info: " + JSON.stringify(response));
        const userUpdated = {
            username: response[0].username,
            email: response[0].email,
            chessComUsername: response[0].chess_com_username
        };
        await createAuthTokens(response[0].username, response[0].id, res);
        return res.status(200).json(userUpdated);
    }
    catch (e) {
        console.log("Error updating user info: " + e);
        return res.status(500).json({ "message": `Error updating user info ${e}` });
    }
}
