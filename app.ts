import express, { type Express, type Request, type Response } from 'express';
import gamesRouter from './routes/games.ts'
import playerRouter from './routes/player.ts'
import dbRouter from './routes/db.ts'
import authRouter from './routes/auth.ts'
import sessionsRouter from './routes/sessions.ts'
import cors from 'cors'
import { corsOptions } from './config/corsConfig.ts';
import { verifyJWT } from './middleware/jwt.ts';
const app: Express = express();
const port = 3000;


app.use(express.json({ limit: "5mb" }))
app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url)
  next()
})
app.use(cors(corsOptions))
app.use('/auth', authRouter)
app.use(verifyJWT)
app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use((req, res, next) => {
  console.log("Hit a route")
  next()
})
app.use('/games', gamesRouter)
app.use('/player', playerRouter)
app.use(`/session`, sessionsRouter)
app.use('/db', dbRouter)

app.listen(port, () => {
  console.log("Running express app")
  console.log(`Example app listening on port ${port}`);
});