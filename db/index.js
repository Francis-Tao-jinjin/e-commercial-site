const { Client, Pool, PoolClient } = require('pg');

const dbConfig = {
    host: 'localhost',
    port: 9900,
    user: 'postgres',
    password: 'devrootpass',
    database: 'dev',
    connectionLimit: 10,
};

class Database {
    constructor() {
        this.connections = new Map();

        this.timer = setInterval(() => {
            if (this.conPool) {
                const { totalCount, idleCount, waitingCount } = this.conPool;
                const now = new Date().valueOf();
                const conns = Array.from(this.connections.values())
                    .sort().reverse()
                    .map((x) =>  `${(now - x) / 1000}s`).join(', ');
                console.log(`[Database Pool]totalCount: ${totalCount}, idleCount:${idleCount}, waitingCount: ${waitingCount}, time of connections: ${conns}`);
            }
        }, 60 * 1000);
    }

    async init() {
        const dbConnectionSettings = {
            host: dbConfig.dbHost,
            port: dbConfig.dbPort,
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword,
            database: 'postgres', // default DB, must specify one
        };
        try {
            c = new Client(dbConnectionSettings);
            try {
                await c.connect();
            } catch {
                console.error(`Unable to connect to Postgres`);
                throw e;
            }
            const r = await c.query(`SELECT * FROM pg_catalog.pg_database WHERE datname = $1;`, [dbConfig.dbDatabase]);
            if (r.rowCount === 0) {
                // Postgres does not support query parameters for some commands, e.g. Table altering ones.
                await c.query(`CREATE DATABASE "${dbConfig.dbDatabase}";`);
            }
            await c.end();
        } catch {
            console.error(`Error while setting up initial connection to database`);
            console.error(e);
            throw e;
        }

        const conPoolSettings = {
            ...dbConnectionSettings,
            database: dbConfig.database,
            max: dbConfig.connectionLimit
        };
        try {
            this.conPool = new Pool(conPoolSettings);
        } catch {
            console.error(`Error while setting up connection pool to database`);
            console.error(censor(conPoolSettings));
            console.error(e);
            throw e;
        }
    }

    async clear() {
        if (this.conPool != null) { return; }
        const dbConnectionSettings = {
            host: dbConfig.dbHost,
            port: dbConfig.dbPort,
            user: dbConfig.dbUser,
            password: dbConfig.dbPassword,
            database: 'postgres', // default DB, must specify one
        };

        const c = new Client(dbConnectionSettings);
        await c.connect();
        const r = await c.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`, [dbConfig.dbDatabase]);
        if (r.rowCount) {
            console.log(`Please disconnection all clients connected to this database:`);
            console.log(r);
            return;
        }

        await c.query(`DROP DATABASE "${dbConfig.dbDatabase}";`);
        await c.query(`CREATE DATABASE "${dbConfig.dbDatabase}";`);
        await c.end();
    }
}

module.exports = {
    Database,
};