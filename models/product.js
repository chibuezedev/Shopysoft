const fs = require('fs');
const path = require('path');

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
  constructor(id, title, imageUrl, description, price) {
    this.id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
//saves the product to (data) folder or database
  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex ( prod => prod.id === this.id)
       
        const updatedProducts = [...products]
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      }
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }
//gets all the products with a callback
  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  //finds each product by id
  static findById(id,cb){
    getProductsFromFile(products => {
      const product = products.find(p => p.id === id)
       cb(product);
    })
   
  }
};
