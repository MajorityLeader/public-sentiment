const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')

const User = sequelize.define('User', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
	},
	zipcode: {
		type: DataTypes.INTEGER,
	}
}, {
	freezeTableName: true
});

module.exports = User