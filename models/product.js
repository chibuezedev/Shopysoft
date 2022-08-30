const fs = require('fs');
const path = require('path');

const db = require('../util/database');

const Cart = require('./cart')

// p saves a file to the folder "data" in form of json
const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

//defines the whole products added
module.exports = class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }
//saves the product to (data) folder or database
  save() {
        getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex ( prod => prod.id === this.id)
       
        const updatedProducts = [...products]
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });
  }

  //deletes products by Id
  static deleteById(id){
    getProductsFromFile(products => {
      const product = products.find(prod => prod.id === id)
      const updatedProduct = products.filter(prod => prod.id !== id)
       fs.writeFile(p, JSON.stringify(updatedProduct), err => {
        if (!err){
          Cart.deleteProduct(id, product.price)
        }
       })
    })
  }

//gets all the products with a callback cb
  static fetchAll(id) {
    db.execute('SELECT * FROM products')
    .this( result => {
      console.log(result[0], result[1])
    })
    .catch( err => {
      console.log(err)
    });
  }

  //finds each product by id
  static findById(id, cb){
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id)
       cb(product);
    })
   
  }
};


