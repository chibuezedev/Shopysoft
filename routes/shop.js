const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const Auth = require('../middleware/is-auth')

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct)

router.get('/cart',Auth, shopController.getCart);

router.post('/cart', Auth, shopController.postCart)

router.post('/delete-cart', Auth, shopController.postCartDelete)

router.get('/orders', Auth, shopController.getOrder);

router.post('/orders', Auth, shopController.postOrder)

router.get('/checkout', Auth, shopController.getCheckout);

module.exports = router;
