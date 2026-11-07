import jwt, {} from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../database/postgresConnection.js';
import { createAuthTokens } from '../controllers/sessionController.js';
dotenv.config();
export async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(403).json({ "message": "Auth header not provided" });
    }
    const [scheme, accessToken] = authHeader.split(" ");
    if (scheme !== "Bearer" || !accessToken) {
        return res.status(401).json({
            message: "Invalid authorization header"
        });
    }
    const verifiedAccessToken = verifyToken(accessToken, true);
    console.log("ACCESS TOKEN VALID:", verifiedAccessToken !== null);
    console.log("Decoded payload:", verifiedAccessToken);
    console.log("Username:", verifiedAccessToken?.username);
    if (verifiedAccessToken != null) {
        console.log("Succesful login", verifiedAccessToken);
        req.user = {
            username: verifiedAccessToken.username
        };
        next();
    }
    else {
        //check the refreshToken
        console.log("ACCESS TOKEN FAILED - TRYING REFRESH");
        const refreshToken = req.headers["x-refresh-token"];
        console.log("REFRESH TOKEN EXISTS:", typeof refreshToken === "string");
        if (typeof refreshToken !== "string") {
            return res.status(401).json({
                message: "Refresh token not provided"
            });
        }
        const refreshTokenFound = await db.query(`SELECT * FROM sessions WHERE refresh_token = $1`, [refreshToken]);
        console.log("REFRESH TOKEN FOUND IN DB:", refreshTokenFound.length > 0);
        if (refreshTokenFound.length == 0) {
            return res.sendStatus(403);
        }
        const verifiedRefreshToken = verifyToken(refreshToken, false);
        if (verifiedRefreshToken != null) {
            console.log("Setting new refresh token");
            //generate new tokens
            //find the user
            const user = await db.query(`SELECT * FROM users WHERE username = $1`, [verifiedRefreshToken.username]);
            await createAuthTokens(user[0].username, user[0].id, res);
            req.user = {
                username: verifiedRefreshToken.username
            };
            console.log("Decoded refresh token", verifiedRefreshToken);
            next();
        }
        else {
            return res.status(403).json({ "message": `Invalid refresh and access token: ${verifiedRefreshToken}` });
        }
    }
}
function verifyToken(token, isAccess) {
    let secret = "";
    if (isAccess) {
        secret = process.env.ACCESS_TOKEN_SECRET;
    }
    else {
        secret = process.env.REFRESH_TOKEN_SECRET;
    }
    try {
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
        return decoded;
    }
    catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.log("TOKEN EXPIRED AT:", err.expiredAt);
            console.log("CURRENT TIME:", new Date());
        }
    }
}
