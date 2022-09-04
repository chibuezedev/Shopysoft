const Product = require('../models/product');
const Order = require('../models/order')



exports.getIndex = (req, res, next) => {
  Product.find()
  .then( products => {
    res.render('shop/index', {
      prod: products,
      pageTitle: 'Shop',
      path: '/'
    });
  }).catch(err => {
    console.log(err);
  })
  
  }

exports.getProducts = (req, res) => {
  Product.find()
  .then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  })
  .catch(err => console.log(err))
}


exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      })
    }
  ).catch(err => {console.log(err)})

}


exports.getCart = (req, res, next) => {
req.user
.populate('user.cart.items')
.execPopulate()
.then( user => {
  const products = user.cart.items
  res.render('shop/cart', {
  path: '/cart',
  pageTitle: 'Your Cart',
  products: products
});
}).catch(err => {console.log(err)})
}




exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId).then(product => {
    return req.user.addToCart(product).then(result => {
      console.log(result).catch(err => {console.log(err)})
    })
  })

  
};


exports.postCartDelete = (req, res) => {
  const prodId = req.body.productId;
req.user.getCart()
.then(cart => {
  return cart.getProducts({ where: { id: prodId}})
}).then(products => {
  const product = products[0]
  return product.cartItem.destroy();
}).then( result =>{
  res.redirect('/cart');
})
.catch(err => {console.log(err)})
}


exports.getOrder = (req, res, next) => {
Order.find({'user.userId': req.user._Id})
  .then(order => {
    res.render('shop/orders', {
      path: '/order',
      pageTitle: 'Your Order'
    });
  }).catch(err => {
    console.log(err)
  })
};


exports.postOrder = (req, res, next) => {
  req.user
  .populate('cart.items.productId').execPopulate()
  .then( user => {
   const products = user.cart.items.map(i => {
    return{quantity: i.quantity, product: {...i.product._doc}}
   })
   const order = new Order({
    user: {
     name: req.user.name,
     userId: req.user
    },
    products: products
   })
   return order.save();
    
  }).then( result => {
     return req.user.clearCart();
  }).then(() => {
    res.redirect('/order')
  })
  .catch(err => {console.log(err)})
}




exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  });
};
