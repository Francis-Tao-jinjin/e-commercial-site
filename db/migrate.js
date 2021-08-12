const { hasTable } = require('./utils');
const { transact } = require('./transact');

async function createMigrationTable(client) {
    console.log('>>> Creating migration table');
    try {
        await client.query(`
            CREATE TABLE "migration" (
                name text,
                applied timestamp);`);
    } catch (e) {
        console.error(`Unable to create migration table`);
        throw e;
    }
}

async function migrate(db, migrations, method) {
    console.log('Migration');
    const con = await db.acquire();
    
    if (!await hasTable(con, 'migration')) {
        await createMigrationTable(con);
    }

    const { rows } = await db.query(`SELECT * FROM migration ORDER BY applied DESC`);
    const appliedMigrations = {};
    for (let i = 0; i < rows.length; i++) {
        appliedMigrations[rows[i].name] = true;
    }

    // Ensure migration ids are unique
    const migNames = {};
    for (let i = 0; i < migrations.length; i++) {
        const name = migrations[i].name;
        if (migNames[name]) {
            throw new Error(`Migration names must be unique. Duplicate: ${name}`);
        }
        migNames[name] = true;
    }

    for (let i = 0; i < migrations.length; i++) {
        const m = migrations[i];
        if (!(method in m) || appliedMigrations[m.name]) {
            console.log(`Already applied: ${m.name}`);
            continue;
        }
        console.log(`Attempting migration ${m.name}`);
        let error = undefined;
        await transact(con, async () => {
            try {
                await m[method](con);
                return true;
            } catch (e) {
                console.log('transact error', e);
                error = e;
                return false;
            }
        });
        if (error !== undefined) {
            console.error(`Error while applying migrations: ${m.name}`);
            console.error(error);
            await db.release(con);
            process.exit(1);
        }
        await con.query(`INSERT INTO migration VALUES($1, $2)`, [m.name, new Date()]);
        console.log(`Applied migration ${m.name}`);
    }
    console.log(`Finished migration, shutting down connection.`);
    await db.release(con);
}

module.exports = {
    migrate,
}