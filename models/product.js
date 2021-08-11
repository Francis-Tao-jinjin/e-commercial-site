const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

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
    constructor(title, imgUrl, description, price) {
        this.title = title;
        this.imageUrl = imgUrl;
        this.description = description;
        this.price = price;
    }
    
    save(cb, productId) {
        if (productId) {
            getProductsFromFile((products) => {
                const existProductIdx = products.findIndex((p) => p.id === productId);
                const updateProducts = [...products];
                updateProducts[existProductIdx] = { ...updateProducts[existProductIdx], ... this };
                fs.writeFile(filePath, JSON.stringify(updateProducts), (err) => {
                    if (err) {
                        console.error(err);
                    }
                    cb();
                });
            });
        } else {
            this.id = uuidv4();
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
    }

    static checkFile() {
        const promise = new Promise((resolve, reject) => {
            if (fs.existsSync(dirPath)) {
                if (fs.existsSync(filePath)) {
                    resolve(true);
                } else {
                    fs.writeFile(filePath, '[]', (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve(true);
                    });
                }
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

    static findById(id, cb) {
        getProductsFromFile((products) => {
            const product = products.find((p) => id===p.id);
            cb(product);
        });
    }

    static deleteById(id, cb) {
        getProductsFromFile((products) => {
            const updateProducts = products.filter((p) => id!==p.id);
            fs.writeFile(filePath, JSON.stringify(updateProducts), (err) => {
                if (err) {
                    console.error(err);
                }
                cb();
            });
        });
    }
}

module.exports = Product;