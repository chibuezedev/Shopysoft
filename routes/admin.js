const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const Auth = require('../middleware/is-auth')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', Auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', Auth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', Auth, adminController.postAddProduct);

router.get('/edit-product/:productId', adminController.getEditProduct)

router.post('/edit-product', Auth, adminController.postEditProduct)


router.post('/delete-product', Auth, adminController.postDeleteProduct)

module.exports = router;
