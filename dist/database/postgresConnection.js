import pgPromise from "pg-promise";
import dotenv from 'dotenv';
dotenv.config();
const pgp = pgPromise({
    capSQL: true
});
const connectionString = process.env.NEON_CONNECTION_URL;
const db = pgp(connectionString);
export default db;
