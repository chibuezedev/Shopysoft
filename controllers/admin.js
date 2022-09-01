const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, imageUrl, price,description)
  product
  .save
  .then( result => {
    console.log(result)
    return redirect('/admin/products')
  })
  .catch( error => {
    console.log(error)
  })
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
  })
  .catch(err => {console.log(err)})
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId, product => {
  if(!product){
    return res.redirect('/');
  }
  
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: editMode,
      product: product
    });
  })
};


exports.postEditProduct = (req, res, next) => {
const prodId = req.body.productId;
const updatedTitle = req.body.title;
const updatedImageURL = req.body.imageUrl;
const updatedPrice = req.body.price;
const updatedDesc = req.body.description;

Product.findById(prodId)
.then(product => {
product.title = updatedTitle;
product.imageUrl = updatedImageURL;
product.price = updatedPrice;
product.description = updatedDesc
return product.save();
})
.then( result => {
  console.log('UPDATED')
  res.redirect('/admin/products')
})
.catch( err => {console.log(err)});
}


exports.postDeleteProduct = (req, res, next) => {
 const prodId = req.body.productId;
 Product.findById(prodId)
 .then( product => {
 return product.destroy();
 }).then(result => {
  console.log('PRODUCT DESTROYED')
  res.redirect('/admin/products')
 })
 .catch(err => {console.log(err)});
}