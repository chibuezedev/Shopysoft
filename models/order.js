const mongoose = require("mongoose")

const Schema = mongoose.Schema;

const orderSchema = new Schema({
 products: [{
    product: {type: String, require: true},
    quantity: {type: Number, require: true}
 }],
user:{
    name: String,
    require: true
},
userId: {
    type: Schema.Types.ObjectId,
    require: true,
    ref: 'User'
}

})


exports.module = mongoose.model('Order', orderSchema)