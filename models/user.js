const mongodb = require('mongodb')
const getDb = require('../util/database').getDb;

const ObjectId = mongodb.ObjectId;

class  User {
    constructor (username, email, id, cart){
        this.username = username;
        this.email = email;
        this._id = id;
        this.cart = cart;
    }
    save(){
     const db = getDb();
    return db.collection('user').insertOne(this)
    }

addToCart(product){
    const cartProductIndex = this.cart.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    })

    let newQuantity = 1;
    const updatedCartItems =[...this.cart.items];

    if (cartProductIndex >= 0){
        newQuantity = this.cart.items[cartProductIndex.quantity + 1]
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else{
        updatedCartItems.push({
            productId: new ObjectId(product._id),
            quantity: newQuantity
        })
    }

    const updatedCart = {item: [{
    productId: new ObjectId(product._id), quantity: 1}]};
    const db = getDB();
    return db
    .collection('users')
    .updateOne({ _id: new ObjectId(this.id)},
    {$set: {cart: updatedCart}}
    )
}

    static findById(userId){
    const db = getDb();
    db.collection('user')
    .findOne({ _id: new ObjectId(userId)})
    .next()
    .then(user => {
        console.log(user)
        return user;
    })
    .catch(err => {console.log(err)})
    }
}

module.exports = User;