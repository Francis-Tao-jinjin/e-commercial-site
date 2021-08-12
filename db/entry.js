const { Database, dbConfig } = require('./index');
const { migrate } = require('./migrate');
const getMigrations = require('./migrations');

// const db2Config = {
//     dbHost: 'localhost',
//     dbPort: 9900,
//     dbUser: 'postgres',
//     dbPassword: 'devrootpass',
//     dbDatabase: 'eshop'
// };

const databaseAction = {
    host: 'host',
    clear: 'clear',
    migrate: 'migrate',
};

async function go(operation) {
    if (operation == databaseAction.migrate) {
        try {
            const db = new Database();
            await db.init(dbConfig);
            await migrate(db, await getMigrations(), 'migrate');
            await db.destruct();
        } catch (e) {
            console.error(`>>> COULD NOT MIGRATE! >>>`);
            console.error(e);
            console.error(`<<< COULD NOT MIGRATE! <<<`);
        }
        return;
    }
    if (operation == databaseAction.clear) {
        try {
            const db = new Database();
            await db.clear(dbConfig);
            process.exit(0);
        } catch (e) {
            console.error(`>>> COULD NOT CLEAR! >>>`);
            console.error(e);
            console.error(`<<< COULD NOT CLEAR! <<<`);
        }
        return;
    }
}

go(databaseAction.migrate).catch((e) => {
    console.error('Error in launcher.');
    console.error(e);
});