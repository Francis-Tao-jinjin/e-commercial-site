const { transactionPrimitive } = require('./transactionPrimitive');

async function transact(c, f) {
    const transaction = await transactionPrimitive(c);
    let shouldCommit = false;
    try {
        shouldCommit = await f();
    } catch (e) {
        await transaction.rollback();
        return e;
    }
    if (shouldCommit) {
        await transaction.commit();
    } else {
        await transaction.rollback();
        return new Error('transaction failed');
    }
}

module.exports = {
    transact,
}