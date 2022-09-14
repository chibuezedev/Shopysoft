const Product = require('../models/product');
const Order = require('../models/order')
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const ITEMS_PER_PAGE = 2; //pagination



exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocments()
  .then( numberProducts =>{
    totalItems = numberProducts;
    return  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit( ITEMS_PER_PAGE)

  }).then( products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      nextPage: page + 1,
      PreviousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  }).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
  }

exports.getProducts = (req, res) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocments()
  .then( numberProducts =>{
    totalItems = numberProducts;
    return  Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit( ITEMS_PER_PAGE)

  }).then( products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      nextPage: page + 1,
      PreviousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    })
  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
})
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      })
    }
  ).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
}


exports.getCart = (req, res, next) => {
req.user
.populate('cart.items.productId')
.exec()
.then( user => {
  const products = user.cart.items
  res.render('shop/cart', {
  path: '/cart',
  pageTitle: 'Your Cart',
  products: products,
});
})
.catch(err => {
  const error = new Error(err)
  error.httpStatusCode = 500
  return next(error)
})
}




exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
  .then(product => {
    return req.user.addToCart(product)
    .then(result => {
     console.log(result)
     res.redirect('/cart')
    })
  }) .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
};


exports.postCartDelete = (req, res) => {
  const prodId = req.body.productId;
  req.user
.removeFromCart(prodId)
.then( result =>{
  res.redirect('/cart');
})
.catch(err => {
  const error = new Error(err)
  error.httpStatusCode = 500
  return next(error)
})
}


exports.getOrder = (req, res, next) => {
Order.find({'user.userId': req.user._Id})
  .then(orders => {
    res.render('shop/orders', {
      path: '/order',
      pageTitle: 'Your Orders',
      orders: orders
    });
  }).catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
};


exports.postOrder = (req, res, next) => {

  const token = req.body.stripeToken;
  let totalSum = 0;

  req.user
  .populate('cart.items.productId').execPopulate()
  .then( user => {
    user.cart.items.forEach(p => {
      totalSum += p.quantity * p.productId.price;
    })
   const products = user.cart.items.map(i => {
    return {quantity: i.quantity, product: {...i.productId._doc}}
   })
   const order = new Order({
    user: {
     email: req.user.email,
     userId: req.user
    },
    products: products
   })
   return order.save();
    
  }).then( result => {
    const charge = stripe.charges.create({
      amount: totalSum * 100,
      currency: 'usd',
      description: 'Demo payment',
      source: token,
      metaData: {order_id: result._id.toString()}
    })
     return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders')
  })
  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
}


exports.getCheckout = (req, res, next) => {
  req.user
  .populate('cart.items.productId')
  .exec()
  .then( user => {
    const products = user.cart.items
    let total = 0 ;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    })
    res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
    products: products,
    totalSum: total
  });
  })
  .catch(err => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return next(error)
  })
};


exports.getInvoice  = (req, res, next) => {

  //get invoice of authorized users
const orderId = req.params.orderId
Order.findById(orderId).then(order => {
  if(!order){
    return next(new Error('No order found'))
  }
  if(order.user.userId.toString() !== req.user._userId.toString()){
  return next(new Error('Unauthorized'))
  }

  const invoiceName = 'invoice-' + orderId + '.pdf'
  const invoicePath = path.join('data', 'invoices', invoiceName)
  
  //stream the file with pdfkit
  const pdfDoc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content- Desposition', 
    'inline; filename="' + invoiceName + '"')

    pdfDoc.pipe(fs.createReadStream(invoicePath))
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {underline: true})

    pdfDoc.text('----------------------------', {textAlign: center})

    order.products.forEach(prod => {
      pdfDoc.text(prod.product.title +
        '_' + 
        prod.quantity + ' x ' + '$' +
        prod.product.price
        )
    })

    pdfDoc.text('------');
    pdfDoc.text.fontSize(20)('Text Price: $' + totalPrice)
    pdfDoc.end();
})
.catch(err =>
   next(new Error(err)))
}