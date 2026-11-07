import express, {} from 'express';
import gamesRouter from './routes/games.js';
import playerRouter from './routes/player.js';
import dbRouter from './routes/db.js';
import authRouter from './routes/auth.js';
import sessionsRouter from './routes/sessions.js';
import cors from 'cors';
import { corsOptions } from './config/corsConfig.js';
import { verifyJWT } from './middleware/jwt.js';
const app = express();
const port = 3000;
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
    console.log("INCOMING:", req.method, req.url);
    next();
});
app.use(cors(corsOptions));
app.use('/auth', authRouter);
app.use(verifyJWT);
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use((req, res, next) => {
    console.log("Hit a route");
    next();
});
app.use('/games', gamesRouter);
app.use('/player', playerRouter);
app.use(`/session`, sessionsRouter);
app.use('/db', dbRouter);
app.listen(port, () => {
    console.log("Running express app");
    console.log(`Example app listening on port ${port}`);
});
