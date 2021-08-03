const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');

const dirPath = path.join(rootDir, 'data');
const filePath = path.join(dirPath, 'product.json');

const getProductsFromFile = (cb) => {
    return Product.checkFile().then((result) => {
        if (result) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    cb([]);
                }
                cb(JSON.parse(data));
            });
        }
    }, (error) => {
        console.error('checkFile Error', error);
        cb([]);
    });
}

class Product {
    constructor(t) {
        this.title = t;
    }

    save(cb) {
        getProductsFromFile((products) => {
            products.push(this);
            fs.writeFile(filePath, JSON.stringify(products), (err) => {
                if (err) {
                    console.error(err);
                }
                cb();
            });
        });
    }

    static checkFile() {

        const promise = new Promise((resolve, reject) => {
            if (fs.existsSync(dirPath)) {
                resolve(true);
            } else {
                fs.mkdir(dirPath, (err) => {
                    if (err) {
                        reject(err);
                    }
                    fs.writeFile(filePath, '[]', (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(true);
                    });
                });
            }
        });
        return promise;
    }

    static fetchAll(cb) {
        getProductsFromFile(cb);
    }
}

module.exports = Product;