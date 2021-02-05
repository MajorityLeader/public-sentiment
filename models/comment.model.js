const { DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')
const BillSection = require('./billsection.model')
const Vote = require('./vote.model')

const Comment = sequelize.define('Comment', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	public: {
		type: DataTypes.BOOLEAN,
	},
	status: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	email: {
		type: DataTypes.STRING,
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
	address: {
		type: DataTypes.STRING(255),
	},
	body: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	deliverToCongress: {
		type: DataTypes.BOOLEAN
	},
	deliveredToCongress: {
		type: DataTypes.BOOLEAN
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
	table: 'Comments'
});

Comment.hasMany(BillSection, {foreignKey: 'commentId', sourceKey: 'id'});
Comment.hasMany(Vote, {foreignKey: 'commentId', sourceKey: 'id'});

module.exports = Comment
