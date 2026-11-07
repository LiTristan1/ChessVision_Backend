
import pgPromise from "pg-promise";
import dotenv from 'dotenv'
import type { Request, Response } from "express";
import fs from "fs"
import path from 'path'
import db from '../database/postgresConnection.ts'
import type { DbGameType, GameStats } from "../types/gameType.ts";
dotenv.config()

export async function deleteGameTable(req: Request, res: Response) {
    try {
        await db.query(`
            DROP TABLE IF EXISTS masterGames`
        )

        res.status(200).json({ "message": "Successfully deleted table mastergames" })
    } catch (e) {
        console.log("Error dropping table mastergames " + e);
    }

}
export async function updateGameTable(req: Request, res: Response) {

    await db.query(`
    CREATE TABLE IF NOT EXISTS masterGames (
        id SERIAL PRIMARY KEY,
        event TEXT,
        site TEXT,
        game_date TEXT,
        round TEXT,
        white TEXT,
        black TEXT,
        result TEXT,
        ply_count INT,
        white_elo INT,
        white_fide_id TEXT,
        white_fide_title TEXT,
        black_elo INT,
        black_fide_id TEXT,
        black_fide_title TEXT,
        eco TEXT,
        source TEXT,
        source_quality TEXT,
        import_date TEXT,
        moves TEXT,
        game_pgn TEXT
    )
`);
    //use lumbras gigabase and lichess api
    const readStream = fs.createReadStream('chessBase\\LumbrasGigaBase_OTB_ELO2400.pgn', {
        encoding: 'utf-8',
        flags: 'r',
        highWaterMark: 1024,
        start: 0,
    })

    //we need to start at event and read until next event
    let buffer = ""
    readStream.on('data', async function (chunk) {
        console.log("Inside read streaam")
        buffer += chunk

        let index1 = buffer.indexOf("[Event");
        let index2 = buffer.indexOf("[Event", index1 + 6)


        //process massive database
        while (index1 != -1 && index2 != - 1) {
            //we have the current game

            console.log("Game **************************")

            const game = buffer.slice(index1, index2);
            console.log(game)

            let params = parseGame(game)

            console.log("Params: ", params)
            console.log("End of game **********************")

            buffer = buffer.slice(index2 + 6);


            await db.query(`
    INSERT INTO masterGames (
        event,
        site,
        game_date,
        round,
        white,
        black,
        result,
        ply_count,
        white_elo,
        white_fide_id,
        white_fide_title,
        black_elo,
        black_fide_id,
        black_fide_title,
        eco,
        source,
        source_quality,
        import_date,
        moves,
        game_pgn
    )
    VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20
    )
`, params);

            index1 = buffer.indexOf("[Event");
            index2 = buffer.indexOf("[Event", index1 + 5)

        }
    })

    return res.status(200).json({ "message": 200 })
}

export async function updateStatsTable(req: Request, res: Response) {
    try {

        await db.query(`
            DROP TABLE IF EXISTS openingStats`)
        await db.query(`
            CREATE TABLE IF NOT EXISTS openingStats(
                id TEXT PRIMARY KEY,
                games INT NOT NULL,
                white_wins INT NOT NULL,
                draws INT NOT NULL,
                black_wins INT NOT NULL
            )`)


        const ecoArr = await db.query(`
    SELECT DISTINCT eco
    FROM masterGames
    WHERE eco IS NOT NULL
    ORDER BY eco
`);
        console.log(`Returned eco array ${JSON.stringify(ecoArr[1].eco.trim())} with length ${ecoArr.length}`)
        let readingsPerCycle = 10000
        for (let i = 0; i < ecoArr.length; i++) {
            let offSet = 0

            while (true && ecoArr[i].eco != "") {
                const response = await db.query(
                    `SELECT * FROM masterGames WHERE eco = $1 LIMIT $2 OFFSET $3`, [ecoArr[i].eco.trim(), readingsPerCycle, offSet]
                )

                //update the stats
                calculateStats(response, ecoArr[i].eco.trim().substring(0, 3), offSet + response.length)
                if (response.length < readingsPerCycle) {
                    break;
                }

                offSet += readingsPerCycle
            }
        }
    } catch (e) {
        console.log("Error creating stats table")
        return res.status(500).json({ "message": `Error creating stats table ${e}` })
    }
}


async function calculateStats(games: DbGameType[], opening: string, numGames: number) {
    let whiteWins = 0;
    let blackWins = 0;
    let draw = 0;
    //console.log(`Calculating stats for opening ${opening} with games number ${games.length}`)
    for (let i = 0; i < games.length; i++) {
        let result = games[i].result
        let whiteResult = result.split("-")[0]
        console.log("White result: " + whiteResult)
        if (whiteResult == "1/2") {
            draw++;
        } else if (whiteResult == "1") {
            whiteWins++;
        } else {
            blackWins++;
        }
    }
    console.log("Opening " + opening + "white_wins: " + whiteWins + "black_wins: " + blackWins + "draws: " + draw)
    try {
        const opening_found = await db.oneOrNone(`
                SELECT * FROM openingStats WHERE id = $1
                `, [opening])

        if (opening_found == null) {

            //console.log(`Not found opening inserting white wins: ${whiteWins} draws ${draw} black_wins ${blackWins}`)
            await db.query(`INSERT INTO openingStats VALUES($1, $2, $3,$4,$5)`, [opening, games.length, whiteWins, draw, blackWins])
        } else {
            await db.query(`UPDATE openingStats set games = $1, white_wins = $2, black_wins = $3, draws = $4 WHERE id = $5`, [opening_found.games + games.length, opening_found.white_wins + whiteWins, opening_found.black_wins + blackWins, opening_found.draws + draw, opening])
        }
    } catch (e) {
        console.log("error inside calculate stats " + e)
    }


}
function parseGame(game: string) {
    //18 fields to parse
    let fields = [
        "[Event",
        "[Site",
        "[Date",
        "[Round",
        "[White",
        "[Black",
        "[Result",
        "[PlyCount",
        "[WhiteElo",
        "[WhiteFideId",
        "[WhiteTitle",
        "[BlackElo",
        "[BlackFideId",
        "[BlackTitle",
        "[ECO",
        "[Source",
        "[SourceQuality",
        "[ImportDate"
    ]; let res: (string | number | null)[] = []
    let indexOfField = 0
    let indexEnd = 0

    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];

        indexOfField = game.indexOf(field)

        if (indexOfField == -1) {
            res[i] = null
        } else {

            indexEnd = game.indexOf(']', indexOfField);

            if (field != "[PlyCount" && field != "[WhiteElo" && field != "[BlackElo") {
                res[i] = game.slice(indexOfField + field.length, indexEnd).replaceAll('"', '').trim()
            } else {
                let ply_count_int = parseInt(game.slice(indexOfField + field.length, indexEnd).replaceAll('"', ''))
                res[i] = Number.isNaN(ply_count_int) ? null : ply_count_int
            }
        }

        //now we get the game
        res[fields.length] = game.slice(indexEnd + 1).trimStart().trimEnd()
        res[fields.length + 1] = game


    }
    return res;
}


/******************************* */
//create a user table


export async function createUserTable(req: Request, res: Response) {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS USERS(
            id UUID PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            chess_com_username TEXT
            
        )`)

        return res.sendStatus(200)
    } catch (e) {
        console.log(`Error creating user table ${e}`)
        return res.status(500).json({ "message": `Error creating user table ${e}` })
    }
}

export async function createPendingUsersTable(req: Request, res: Response) {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS PENDINGUSERS(
            id UUID PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            chess_com_username TEXT

        )`)

        return res.sendStatus(200)
    } catch (e) {
        console.log(`Error creating user table ${e}`)
        return res.status(500).json({ "message": `Error creating user table ${e}` })
    }
}

export async function createSessionTable(req: Request, res: Response) {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS SESSIONS(
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                access_token TEXT NOT NULL,
                refresh_token TEXT NOT NULL
            )`)

        return res.sendStatus(200)
    } catch (e) {
        console.log(`Error creating session table ${e}`)
        return res.status(500).json({ "message": `Error creating session table: ${e}` })
    }
}

/**
 * uses Lichess's opening dataset and parses all openings into one table for easy search
 * store in backend to its easier to update, frontend just calls this 
 * @param req 
 * @param res 
 */
export async function createOpeningTable(req: Request, res: Response) {
    console.log("Inside create opening table")
    try {


        await db.query(`CREATE TABLE IF NOT EXISTS OPENINGS(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            opening_class CHAR(1) NOT NULL,
            eco VARCHAR(3) NOT NULL,
            name TEXT NOT NULL,
            pgn TEXT NOT NUll
        )`)
        //read a.tsv


        let filepaths = [path.resolve(import.meta.dirname
            , "../chessBase/a.tsv"), path.resolve(import.meta.dirname
                , "../chessBase/b.tsv"), path.resolve(import.meta.dirname
                    , "../chessBase/c.tsv"), path.resolve(import.meta.dirname
                        , "../chessBase/d.tsv"), path.resolve(import.meta.dirname
                            , "../chessBase/e.tsv")]


        for (const filepath of filepaths) {
            let data = fs.readFileSync(filepath, "utf-8")
            let lines = data.trim().split(/\r?\n/)
            //
            for (const line of lines.slice(1)) {
                const [eco, name, pgn] = line.split("\t")
                console.log(`Parsed eco ${eco}, name ${name}, and pgn ${pgn}`)
                await db.query(`INSERT INTO OPENINGS(opening_class, eco, name, pgn) VALUES($1, $2, $3, $4)`, [eco[0], eco, name, pgn])
            }

        }

        return res.sendStatus(200)
    } catch (e) {
        return res.json(`error creating opening table: ${e}`).status(500)
    }


}


export async function createPWResetsTable(req: Request, res: Response) {
    try {
        await db.query(`CREATE TABLE IF NOT EXISTS PWRESETS(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
            token_hash TEXT NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )`)

        return res.sendStatus(200)




    } catch (e) {
        console.log("Error resetting password: " + e)
        return res.status(500).json({ "message": "Error creating pw reset table: " + e })
    }
}

export async function createEmailConfirmationTable(req: Request, res: Response) {
    try {
        const response = await db.query(`CREATE TABLE IF NOT EXISTS EMAILCONFIRMATION (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                pending_user_id UUID NOT NULL UNIQUE
                    REFERENCES PENDINGUSERS(id)
                    ON DELETE CASCADE,
                token_hash TEXT UNIQUE NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                expires_at TIMESTAMPTZ NOT NULL
            )`)


        return res.sendStatus(200)
    } catch (e) {
        console.log("Error creating email confirmation table")
        return res.status(500).json({ "message": `Error creating email confirmation table: ${e}` })
    }
}














//ToDo: Preserve existing data

//user table should link with a games table

//variations table should link to the games table and be related to a specific game

//register user
