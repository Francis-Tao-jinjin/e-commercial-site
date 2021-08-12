const { Client, Pool, PoolClient } = require('pg');

const dbConfig = {
    dbHost: 'localhost',
    dbPort: 9900,
    dbUser: 'postgres',
    dbPassword: 'devrootpass',
    dbDatabase: 'eshop',
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

    async init(config, dbConf=config) {
        if (this.conPool != null) { return; }

        const dbConnectionSettings = {
            host: dbConf.dbHost,
            port: dbConf.dbPort,
            user: dbConf.dbUser,
            password: dbConf.dbPassword,
            database: 'postgres', // default DB, must specify one
        };
        try {
            const c = new Client(dbConnectionSettings);
            try {
                await c.connect();
            } catch (e) {
                console.error(`Unable to connect to Postgres`);
                throw e;
            }
            const r = await c.query(`SELECT * FROM pg_catalog.pg_database WHERE datname = $1;`, [dbConf.dbDatabase]);
            if (r.rowCount === 0) {
                // Postgres does not support query parameters for some commands, e.g. Table altering ones.
                await c.query(`CREATE DATABASE "${dbConf.dbDatabase}";`);
            }
            await c.end();
        } catch (e) {
            console.error(`Error while setting up initial connection to database`);
            console.error(e);
            throw e;
        }

        const conPoolSettings = {
            ...dbConnectionSettings,
            database: dbConf.dbDatabase,
            max: config.connectionLimit
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

    async clear(config, dbConf=config) {
        if (this.conPool != null) { return; }
        const dbConnectionSettings = {
            host: dbConf.dbHost,
            port: dbConf.dbPort,
            user: dbConf.dbUser,
            password: dbConf.dbPassword,
            database: 'postgres', // default DB, must specify one
        };

        const c = new Client(dbConnectionSettings);
        await c.connect();
        const r = await c.query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`, [dbConf.dbDatabase]);
        if (r.rowCount) {
            console.log(`Please disconnection all clients connected to this database:`);
            console.log(r);
            return;
        }

        await c.query(`DROP DATABASE "${dbConf.dbDatabase}";`);
        await c.query(`CREATE DATABASE "${dbConf.dbDatabase}";`);
        await c.end();
    }

    /**
     * Get a connection to the database. Should only be needed if
     * you want to wrap it in a transaction.
     *
     * After you are finished with the connection YOU MUST call the
     * Database `release` method with the connection as an argument
     * to hand back the DB connection to the connection pool.
     */
    async acquire() {
        if (this.conPool === null) {
            throw new Error(`You forgot to initialize the database connections`);
        }
        const con = await (this.conPool).connect();
        this.connections.set(con, new Date().valueOf());
        return con;
    }

    async release(con) {
        if (this.conPool === null) {
            throw new Error(`You forgot to initialize the database connections`);
        }
        this.connections.delete(con);
        return con.release();
    }

    async query(...args) {
        if (this.conPool === null) {
            throw new Error(`You forgot to initialize the database connections`);
        }
        for (const arg of args) {
            console.log(arg);
        }
        return this.conPool.query.apply(this.conPool, args);
    }

    async destruct() {
        if (this.conPool === null) {
            throw new Error(`You forgot to initialize the database connections`);
        }
        await this.conPool.end();
        this.conPool = null;
        clearInterval(this.timer);
    }

}

module.exports = {
    Database,
    dbConfig,
};