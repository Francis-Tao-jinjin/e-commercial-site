const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('add-product', {
		docTitle: '添加产品',
		path: '/admin/add-product',
		activeAddProduct: true,
		breadcrumb: [
			{ name: '首页', url: '/', hasBreadcrumbUrl: true },
			{ name: '添加产品', hasBreadcrumbUrl: false },
		],
	});
};

exports.postAddProduct = (req, res, next) => {
	const newProduct = new Product(req.body.title);
	newProduct.save(() => {
		res.redirect('/');
	});

};

exports.getProducts = (req, res, next) => {
	Product.fetchAll((allProducts) => {
		res.render('shop', {
			prods: allProducts,
			docTitle: '商城',
			path: '/',
			hasProducts: allProducts.length > 0,
			activeShop: true,
			breadcrumb: [
				{ name: '首页', url: '/', hasBreadcrumbUrl: true },
				{ name: '商城', hasBreadcrumbUrl: false },
			],
		});
	});
};
