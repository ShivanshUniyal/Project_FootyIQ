import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(
    __dirname,
    "..",
    "database",
    "footyiq_real.db"
);

const db = new Database(dbPath);

console.log("Connected to FootyIQ real database!");

export default db;