const Product = require('../models/product');

const fileHelper = require('../util/file')

const { validationResult } = require('express-validator/check')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validatorErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const image = req.file;
  const description = req.body.description;

 if(!image){
  return res.status(422).render('/admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/edit-product',
    editing: false,
    hasError: true,
    product: {
      title: title,
      price: price,
      description: description
    },
    errorMessage: 'Attached file is not an image',
    validationErrors: []
  })
 }
  const errors = validationResult(req)

  if (!errors.isEmpty()){
    console.log(errors.array())
   return res.status(422).render('/admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl, 
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    })
  }

  const imageUrl =  image.path;

  const product = new Product({
   title: title, 
   imageUrl: imageUrl, 
   price: price, 
   description: description, 
   userId: req.user
  })
  product.save()
  .then( result => {
    return redirect('/admin/products')
  })
  .catch( err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.body.user._id})
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  })
  .catch(err => { 
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)})
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then( product => {
  if(!product){
    return res.redirect('/');
  }
  
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/add-product',
      editing: editMode,
      product: product,
      hasError: false,
      errorMessage: null,
      validationErrors: []
    });
  }).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
};


exports.postEditProduct = (req, res, next) => {
const prodId = req.body.productId;
const updatedTitle = req.body.title;
const image = req.file;
const updatedPrice = req.body.price;
const updatedDesc = req.body.description;

const errors = validationErrors(req)

if (!errors.isEmpty()){
  return res.status(422).render('admin/edit-product', {
    pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
  })
}
Product.findById(prodId)
.then(product => {
  if (product.userId.toString() !== req.user._id.toString()) {
    req.flash('error', 'You are not allowed to edit this Post!')
    return res.redirect('/');
  }
  product.title = updatedTitle,
  product.price = updatedPrice,
  product.description = updatedDesc

 if(image){
  fileHelper.deletefile(product.imageUrl)
  product.imageUrl = image.path;
 }

  return product.save().then( result => {
    console.log('UPDATED')
    res.redirect('/admin/products')
  })
})
.catch( err => {
  const error = new Error(err)
  error.httpStatusCode = 500
  return next(error)
});
}


exports.deleteProduct = (req, res, next) => {

 const prodId = req.params.productId;

 Product.findById(prodId)
 .then(product => {
  if(!product){
   return next(new Error('Product not found'))
  }
  fileHelper.deletefile(product.imageUrl)
  return  Product.deleteOne({_id: prodId, userId: req.user._id})
 })
 
.then(() => {
  console.log('DELETED')
      res.status(200).json({message: 'Success!'})
 })
 .catch(err => {
   res.status(500).json({message: 'Product deleting failed!'})
 });


}