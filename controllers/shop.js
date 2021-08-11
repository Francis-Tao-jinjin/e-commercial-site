const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
	Product.fetchAll((allProducts) => {
		res.render('shop/product-list', {
			prods: allProducts,
			docTitle: 'Product Center',
			activeProductList: true,
			breadcrumb: [
				{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
				{ name: 'Product Center', hasBreadcrumbUrl: false },
			],
		});
	});
};

exports.getIndex = (req, res, next) => {
	Product.fetchAll((allProducts) => {
		res.render('shop/index', {
			prods: allProducts,
			docTitle: 'Store',
			activeShop: true,
			breadcrumb: [
				{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
				{ name: 'Store', hasBreadcrumbUrl: false },
			],
		});
	});
};

exports.getCart = (req, res, next) => {
	Cart.getCart((cart) => {
		Product.fetchAll((products) => {
			const cartProducts = [];
			for (product of products) {
				const cartProductData = cart.products.find((prod) => prod.id===product.id);
				if (cartProductData) {
					cartProducts.push({...product, count: cartProductData.count});
				}
			}
			res.render('shop/cart', {
				docTitle: 'Cart',
				activeCart: true,
				breadcrumb: [
					{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
					{ name: 'Cart', hasBreadcrumbUrl: false },
				],
				cartProducts: cartProducts,
				totalPrice: cart.totalPrice,
			});
		});	
	});
};

exports.getCheckout = (req, res, next) => {
	res.render('shop/checkout', {
		docTitle: 'Checkout',
		activeCheckout: true,
		breadcrumb: [
			{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
			{ name: 'Checkout', hasBreadcrumbUrl: false },
		],
	});
};

exports.getProductDetail = (req, res, next) => {
	const productId = req.params.productId;
	console.log('productId:', productId);
	Product.findById(productId, (product) => {
		res.render('shop/product-detail', {
			docTitle: 'Product Details',
			product: product,
			activeProductList: true,
			breadcrumb: [
				{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
				{ name: 'Product Center', url: '/product-list', hasBreadcrumbUrl: true },
				{ name: 'Product Details', hasBreadcrumbUrl: false },
			],
		})
	});
};

exports.postAddToCart = (req, res, next) => {
	const productId = req.body.productId;
	console.log('productId:', productId);

	Product.findById(productId, (product) => {

		Cart.addProduct(productId, product.price, () => {
			res.redirect('/cart');
		});
	});
}

exports.postCartDeleteProduct = (req, res, next) => {
	const productId = req.body.productId;
	console.log('productId', productId);
	Product.findById(productId, (product) => {
		console.log('>> in postCartDeleteProduct');
		Cart.deleteProduc(productId, product.price, () => {
			res.redirect('/cart');
		});
	});
}