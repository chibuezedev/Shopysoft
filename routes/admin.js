const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');

const { body } = require('express-validator');

const Auth = require('../middleware/is-auth')

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', Auth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', Auth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ], Auth, adminController.postAddProduct);

router.get('/edit-product/:productId', Auth, adminController.getEditProduct)

router.post('/edit-product',  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('imageUrl').isURL(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ], Auth, adminController.postEditProduct)


router.post('/delete-product', Auth, adminController.postDeleteProduct)

module.exports = router;
