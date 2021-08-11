const { Database } = require('./index');

async function go() {
    try {
        const db = new Database();
        await db.init(config);
        await migrate(db, await getMigrations(), 'migrate');
        await createView(db);
        await createFunction(db);
        await db.destruct();
    } catch (e) {
        console.error(`>>> COULD NOT MIGRATE! >>>`);
        console.error(e);
        console.error(`<<< COULD NOT MIGRATE! <<<`);
    }
    return;
}

go().catch((e) => {
    console.error('Error in launcher.');
    console.error(e);
});