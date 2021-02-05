const { DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')

const BillSection = sequelize.define('BillSection', {
	name: DataTypes.STRING
}, {
	freezeTableName: true,
});

module.exports = BillSection