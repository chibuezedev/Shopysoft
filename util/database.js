const mongodb = require('mongodb')

const MongoClient = mongodb.MongoClient

let _db;

const mongoConnect = () => {
    MongoClient.connect(
        'mongodb+srv://Paul:y9DSqyzD8uiQ9n8g@node-class.iz8y6zp.mongodb.net/?retryWrites=true&w=majority')
        .then( client =>{
            console.log("connected")
          _db = client.db();
        })
        .catch(err => {
        console.log(err)
        throw err;
    })
};

const getDb = () => {
    if(_db){
        return _db;
    }
    throw "No Database found";
}


exports.mongoConnect = mongoConnect;
exports.getDb = getDb;



































































// const mysql = require('mysql2')


// const pool = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     database: 'node-complete',
//     password: 'paulchibueze'
// })

// module.exports = pool.Promise();