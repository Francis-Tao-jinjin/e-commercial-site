async function migrate(c) {
    console.log('insiede actual migrate function');
    await c.query(`
        CREATE TABLE "product" (
            id SERIAL PRIMARY KEY,
            title text,
            imageUrl text,
            description text,
            price integer
        );
    `);
}

module.exports = {
    migration: {
        migrate,
        name: 'create-product',
        description: 'Create Product Table with Id and Title, Description, and Price',
    }
};


