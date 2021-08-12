const { Database, dbConfig } = require(".");

let db = null;

async function getDataBase() {
    if (db) {
        return db;
    }
    try {
        db = new Database();
        await db.init(dbConfig);
        return db;
    } catch(e) {
        console.error(`Could not get database when initialize`);
        console.error(e);
    }
}

module.exports = {
    getDataBase,
}