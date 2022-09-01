const Sequelize = require('sequelize');


const sequelize = require('../utils/database')

const Order = sequelize.defind('order', {
    id: {
       type: Sequelize.INTEGER,
       autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = Order;