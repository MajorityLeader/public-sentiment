const { DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')

const Event = sequelize.define('Event', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	category: {
		type: DataTypes.STRING(),
	},
	event: {
		type: DataTypes.STRING(),
	},
	itemId: {
		type: DataTypes.INTEGER(),
	},
	data: {
		type: DataTypes.JSON,
	},
}, {
	indexes: [
		{unique:true, fields:['itemId']}
	]
});

module.exports = Event
