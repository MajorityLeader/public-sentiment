const { DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')
const BillSection = require('./billsection.model')

const Supporter = sequelize.define('Supporter', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	bill: {
		type: DataTypes.STRING,
		allowNull: false,
		defaultValue: 'hr7120-116'
	},
	supports: {
		type: DataTypes.BOOLEAN,
		allowNull: false,
		defaultValue: true
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	name: {
		type: DataTypes.STRING,
	},
	zipcode: {
		type: DataTypes.INTEGER,
	},
	geo: {
		type: DataTypes.JSON
	},
	submissionScore: {
		type: DataTypes.DECIMAL(10,1)
	},
	ipAddress: {
		type: DataTypes.STRING(45)
	},
	isProfane: {
		type: DataTypes.BOOLEAN
	}
}, {
	freezeTableName: true,
	indexes: [
		{unique:true, fields:['email']}
	],
	hasMany: BillSection
});


module.exports = Supporter