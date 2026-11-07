import db from '../database/postgresConnection.js';
import {} from "../types/gameType.js";
import dotenv from 'dotenv';
dotenv.config();
const chess_com_base_url = process.env.CHESS_COM_BASE_URL;
const lichess_base_url = process.env.LICHESS_BASE_URL;
//This should retrieve all user games and provide them in an array format as specified by chess.com
//Should retrieve all games from the past year for the user and we should organize based on the data retrieved
//TODO: Retrieve all games for a user based on date will need to provide such an option in the frontend
export async function getGamesByYear(userName, year) {
    try {
        console.log(`${chess_com_base_url}/player/${userName}/games/${year}`);
        const response = await fetch(`${chess_com_base_url}/player/${userName}/games/archives`);
        const data = await response.json();
        var processed_data = {
            "archives": []
        };
        for (let i = 0; i < data.archives.length; i++) {
            var url = data.archives[i];
            if (url.indexOf(year) != -1) {
                processed_data.archives.push(url);
            }
        }
        //now we will retrieve all the games from the urls
        let gamesByMonth = [];
        for (let i = 0; i < processed_data.archives.length; i++) {
            const url = processed_data.archives[i];
            try {
                const monthlyResponse = await getMonthlyGame(url);
                gamesByMonth.push(monthlyResponse ?? []);
            }
            catch (e) {
                console.log("error fetching monthly games from " + url);
            }
        }
        if (response.ok) {
            return gamesByMonth;
        }
    }
    catch (err) {
        console.log("Error getting all games response " + err);
    }
}
async function getMonthlyGame(url) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const response_json = await response.json();
            const games = response_json.games.map((game) => ({
                ...game,
                id: game.url.split("/").filter(Boolean).pop() ?? ""
            }));
            return games;
        }
        console.log("Error fetching monthly games " + response.statusText);
        return null;
    }
    catch (e) {
        console.log("Error fetching monthly games " + e);
        return null;
    }
}
export async function getOTBStatsOfPosition(req, res, gameString) {
    try {
        gameString = gameString.trim();
        const response = await db.query(`SELECT result, COUNT(*) AS count
             FROM masterGames
             WHERE moves LIKE $1
             GROUP BY result`, [`${gameString}%`]);
        if (response.length == 0) {
            return null;
        }
        let white_wins = response[1] ? parseInt(response[1].count) : 0;
        let black_wins = response[0] ? parseInt(response[0].count) : 0;
        let draws = response[2] ? parseInt(response[2].count) : 0;
        let returnedResponseValue = {
            white_wins: white_wins,
            black_wins: black_wins,
            games: white_wins + black_wins + draws,
            draws: draws
        };
        return returnedResponseValue;
    }
    catch (e) {
        console.log("Error getting OTB stats of position");
        throw e;
    }
}
export async function getMasterGamesByPosition(req, res, gameString) {
    try {
        const response = await db.query(`SELECT id, black_elo, white_elo, event, white, black FROM masterGames WHERE moves LIKE $1 ORDER BY (white_elo + black_elo) / 2 DESC LIMIT 30`, [`${gameString}%`]);
        return response;
    }
    catch (e) {
        console.log("Error getting master games by position");
        throw e;
    }
}
export async function getGameById(req, res, id) {
    try {
        const response = await db.query(`SELECT moves FROM masterGames WHERE id = $1 LIMIT 1`, [id]);
        return response;
    }
    catch (e) {
        console.log("Error getting master game by ID: " + e);
    }
}
// export async function getPositionAnalysisOverTime(
//     play: string,
//     moves: number,
//     since: number,
//     until: number
// ): Promise<GameStats | null> {
//     try {
//         const url =
//             `${lichess_base_url}/masters` +
//             `?play=${encodeURIComponent(play)}` +
//             `&since=${since}` +
//             `&until=${until}` +
//             `&moves=${moves}` +
//             `&topGames=20`;
//         const response = await fetch(url, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.LICHESS_SECRET_TOKEN}`
//             }
//         });
//         if (!response.ok) {
//             console.log(
//                 "Lichess request failed:",
//                 response.status
//             );
//             return null;
//         }
//         const response_json: LichessOpeningResponse =
//             await response.json();
//         const stats: GameStats = {
//             games:
//                 response_json.white +
//                 response_json.black +
//                 response_json.draws,
//             white_wins: response_json.white,
//             black_wins: response_json.black,
//             draws: response_json.draws
//         };
//         return stats;
//     } catch (e) {
//         console.log(
//             "Error getting position analysis over time:",
//             e
//         );
//         return ;
//     }
// }
//engine of the app
export async function getFullGameAnalysis(req, res, input) {
    let response = [];
    for (let i = 0; i < input.length; i++) {
        const responseMaster = await getMasterGamesByPosition(req, res, input[i].gameString);
        const responseOTB = await getOTBStatsOfPosition(req, res, input[i].gameString);
        if (responseOTB == null) {
            //console.log("Response is empty")
            for (let j = i; j < input.length; j++) {
                response.push({
                    gameString: input[j].gameString,
                    play: input[j].play,
                    masterGames: null,
                    otbStats: null
                });
            }
            // console.log(
            //     "Pushed analysis:",
            //     JSON.stringify(response[response.length - 1])
            // );
            break;
        }
        //
        //combine into one result
        response.push({
            gameString: input[i].gameString,
            play: input[i].play,
            masterGames: responseMaster,
            otbStats: responseOTB
        });
        // console.log(
        //     "Pushed analysis:",
        //     JSON.stringify(response[response.length - 1])
        // );
    }
    return response;
}
export async function getAllOpenings(req, res) {
    console.log("Getting all openings");
    if (!req.body) {
    }
    if (!req.body || !req.body.filterByEco) {
        //we will just get everything
        const response = await db.query(`SELECT * FROM OPENINGS`);
        return response;
    }
    const filterByEco = req.body.filterByEco;
    const response = await db.query(`SELECT * FROM OPENINGS WHERE eco = ${filterByEco}`);
    return response;
}
