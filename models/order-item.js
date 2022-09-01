const Sequelize = require('sequelize');


const sequelize = require('../utils/database')

const OrderItem = sequelize.defind('orderItem', {
    id: {
       type: Sequelize.INTEGER,
       autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    quantity: Sequelize.INTEGER
})

module.exports = OrderItem;