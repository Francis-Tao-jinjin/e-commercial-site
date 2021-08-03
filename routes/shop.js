const express = require('express');
const path = require('path');
const productController = require('../controllers/product');

const router = express.Router();

router.get('/', productController.getProducts);

module.exports = router;
