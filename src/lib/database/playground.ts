import "./env";
import Database from "better-sqlite3";
import { env } from "node:process";

const db = new Database(env.PLAYGROUND_DATABASE_URL);
export default db;
