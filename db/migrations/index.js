async function getMigrations() {
    const migrations = [
        require('./1-create-product'),
    ];

    return (await Promise.all(migrations)).map((mi) => mi.migration)
}

module.exports = getMigrations;