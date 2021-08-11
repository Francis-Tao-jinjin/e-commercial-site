const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		docTitle: 'Add Product',
		// path: '/admin/add-product',
		activeAddProduct: true,
		breadcrumb: [
			{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
			{ name: 'Add Product', hasBreadcrumbUrl: false },
		],
	});
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const productId = req.params.productId;
    Product.findById(productId, (prod) => {
        if (!prod) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            docTitle: 'Edit Product',
            activeProductManage: true,
            breadcrumb: [
                { name: 'Home', url: '/', hasBreadcrumbUrl: true },
                { name: 'Edit Product', hasBreadcrumbUrl: false },
            ],
            editing: editMode,
            product: prod,
        });
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

	const newProduct = new Product(title, imageUrl, description, price);
	newProduct.save(() => {
        console.log('already saved, redirecting');
		res.redirect('/');
	});
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;
    const newProduct = new Product(title, imageUrl, description, price);

	newProduct.save(() => {
        console.log('already saved, redirecting');
		res.redirect('/');
	}, productId);
}

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    
    console.log('>>postDeleteProduct');
    Product.deleteById(productId, () => {
        res.redirect('/');
    });
};

exports.getProducts = (req, res, next) => {
	Product.fetchAll((allProducts) => {
		res.render('admin/products', {
			prods: allProducts,
			docTitle: 'Product Manage',
			activeProductManage: true,
			breadcrumb: [
				{ name: 'Home', url: '/', hasBreadcrumbUrl: true },
				{ name: 'Product Manage', hasBreadcrumbUrl: false },
			],
		});
	});
};
