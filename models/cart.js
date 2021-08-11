const rootDir = require('../util/path');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dirPath = path.join(rootDir, 'data');
const filePath = path.join(dirPath, 'cart.json');

const getCartFromFile = (cb) => {
    return Cart.checkFile().then((result) => {
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

class Cart {
    static checkFile() {
        const promise = new Promise((resolve, reject) => {
            if (fs.existsSync(dirPath)) {
                if (fs.existsSync(filePath)) {
                    resolve(true);
                } else {

                    fs.writeFile(filePath, "{\"products\":[],\"totalPrice\":0}", (err) => {
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
                    fs.writeFile(filePath, "{\"products\":[],\"totalPrice\":0}", (err) => {
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

    static addProduct(id, price, cb) {
        getCartFromFile((cart) => {
            const existsProductIndex = cart.products.findIndex((prod) => prod.id === id);
            let updateProduct = { count: 0, id:'' };
            if (existsProductIndex < 0) {
                updateProduct = { id: id, count: 1 };
                cart.products.push(updateProduct);
            } else {
                let existProduct = cart.products[existsProductIndex];
                updateProduct.count = existProduct.count + 1;
                updateProduct.id = existProduct.id;
                cart.products[existsProductIndex] = updateProduct;
            }
            cart.totalPrice = cart.totalPrice + Number(price);
            fs.writeFile(filePath, JSON.stringify(cart), (err) => {
                if (err) {
                    console.error(err);
                }
                cb();
            });
            console.log('cart', cart);
        });
    }

    static getCart(cb) {
        getCartFromFile((cart) => {
            cb(cart);
        });
    }

    static deleteProduc(id, price, cb) {
        getCartFromFile((cart) => {
            const updateCart = {...cart};
            const product = updateCart.products.find((prod) => prod.id===id);
            if (!product) {
                cb();
                return;
            }
            const productCount = product.count;
            updateCart.products = updateCart.products.filter((p) => p.id!==id);
            updateCart.totalPrice -= price * productCount;
            fs.writeFile(filePath, JSON.stringify(updateCart), (err) => {
                if (err) {
                    console.error(err);
                }
            });
            cb();
        });
    }
}

module.exports = Cart;