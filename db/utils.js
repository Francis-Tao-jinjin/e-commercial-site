async function hasTable(client, table, schema='public') {
    try {
        const r = await client.query(
            `SELECT EXISTS(
                SELECT 1
                FROM pg_tables
                WHERE schemaname = $1
                    AND tablename = $2);`,
            [schema, table]);
        const res = r.rows[0];
        if (res === undefined) {
            throw new Error('Did not get any results from query');
        }
        console.log(`Does table: ${table} exist? ${res.exists}`);
        return res.exists;
    } catch (e) {
        console.error(`Could not query for existence of table ${table} in schema ${schema}`);
        console.error(e);
        throw e;
    }
}

module.exports = {
    hasTable,
}