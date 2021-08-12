
const savepointIds = new Map();

/**
 * This must only be used by test and db internals.
 * Use `transact` from `./transaction.ts` instead.
 *
 * It ensures that we can fulfill the following needs:
 * * Test database is able to rollback changes after test run
 * * Test database transaction wraps application defined transactions
 *
 * However, the API presented here is very dangerous. We assume:
 * * Callers won't call commit or rollback functions more than once
 * * Callers won't call commit or rollback functions in bad order
 *   if transactions are nested
 */

async function transactionPrimitive(c) {
    const id = savepointIds.get(c) || 0;
    savepointIds.set(c, id+1);
    if (id === 0) {
        await c.query(`START TRANSACTION ISOLATION LEVEL READ COMMITTED;`);
        return {
            commit: async () => {
                await c.query(`COMMIT;`);
                savepointIds.delete(c);
            },
            rollback: async () => {
                await c.query(`ROLLBACK;`);
                savepointIds.delete(c);
            },
        };
    } else {
        const savepointName = `level_${id}`;
        await c.query(`SAVEPOINT "${savepointName}";`);
        return {
            commit: async () => {
                await c.query(`RELEASE SAVEPOINT ${savepointName};`);
                savepointIds.set(c, id);
            },
            rollback: async () => {
                await c.query(`ROLLBACK TO SAVEPOINT ${savepointName};`);
                savepointIds.set(c, id);
            },
        };
    }
}

module.exports = {
    transactionPrimitive,
}