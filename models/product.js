const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');
const { getDataBase } = require('../db/getDatabase');

// const dirPath = path.join(rootDir, 'data');
// const filePath = path.join(dirPath, 'product.json');

// const getProductsFromFile = (cb) => {
//     return Product.checkFile().then((result) => {
//         if (result) {
//             fs.readFile(filePath, (err, data) => {
//                 if (err) {
//                     cb([]);
//                 }
//                 cb(JSON.parse(data));
//             });
//         }
//     }, (error) => {
//         console.error('checkFile Error', error);
//         cb([]);
//     });
// }

class Product {
    constructor(title, imgUrl, description, price) {
        this.title = title;
        this.imageUrl = imgUrl;
        this.description = description;
        this.price = price;
    }
    
    save(cb, productId) {
        if (productId) {
            if (typeof productId == 'string') {
                productId = Number(productId);
            }
            const title = this.title;
            const description = this.description;
            const price = Number(this.price);
            const imageUrl = this.imageUrl;
            getDataBase().then((db) => {
                return db.query(`
                UPDATE product SET title=$1, imageurl=$2, description=$3, price=$4 WHERE id=$5;
                `, [title, imageUrl, description, price, productId]);
            }).then(() => {
                cb();
            }).catch((error) => {
                console.error(err);
                cb();
            });
        } else {
            const title = this.title;
            const description = this.description;
            const price = this.price;
            const imageUrl = this.imageUrl;

            getDataBase().then((db) => {
                return db.query(`
                INSERT INTO product (title, imageUrl, description, price) VALUES ($1, $2, $3, $4)
                `, [title, imageUrl, description, price]);
            }).then(() => {
                cb();
            }).catch((error) => {
                console.error(err);
                cb();
            });
        }
    }

    // static checkFile() {
    //     const promise = new Promise((resolve, reject) => {
    //         if (fs.existsSync(dirPath)) {
    //             if (fs.existsSync(filePath)) {
    //                 resolve(true);
    //             } else {
    //                 fs.writeFile(filePath, '[]', (err) => {
    //                     if (err) {
    //                         reject(err);
    //                     }
    //                     resolve(true);
    //                 });
    //             }
    //         } else {
    //             fs.mkdir(dirPath, (err) => {
    //                 if (err) {
    //                     reject(err);
    //                 }
    //                 fs.writeFile(filePath, '[]', (err) => {
    //                     if (err) {
    //                         reject(err);
    //                     }
    //                     resolve(true);
    //                 });
    //             });
    //         }
    //     });
    //     return promise;
    // }

    static fetchAll(cb) {
        getDataBase().then((db) => {
            db.query(`SELECT * FROM product;`)
            .then(({rows}) => {
                // console.log(result);
                const data = rows.map((item) => {
                    return {
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        imageUrl: item.imageurl,
                        price: item.price,
                    };
                });
                cb(data);
            });
        }).catch((error) => {
            console.error('fetchAll error');
            console.error(error);
        });
    }

    static findById(id, cb) {
        if (typeof id === 'string') {
            id = Number(id);
        }
        getDataBase().then((db) => {
            return db.query(`
            SELECT * FROM product WHERE id=$1
            `, [id]);
        }).then(({rows}) => {
            if (rows.length === 0) {
                return cb({});
            }
            cb({
                id: rows[0].id,
                title: rows[0].title,
                description: rows[0].description,
                imageUrl: rows[0].imageurl,
                price: rows[0].price,
            });
        }).catch((error) =>  {
            console.error(error);
        });
    }

    static deleteById(id, cb) {
        if (typeof id === 'string') {
            id = Number(id);
        }
        getDataBase().then((db) => {
            return db.query(`
            DELETE FROM product WHERE id=$1
            `, [id]);
        }).then(() => {
            cb();
        }).catch((err) => {
            console.error(err);
        });
    }
}

module.exports = Product;