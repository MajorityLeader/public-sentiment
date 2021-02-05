const { DataTypes } = require('sequelize');
const sequelize = require('../datasources/mysql.justice.sequelize')

const Vote = sequelize.define('Vote', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	commentId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	voteType: {
		type: DataTypes.STRING
	},
	ipAddress: {
		type: DataTypes.STRING(45)
	},
	submissionScore: {
		type: DataTypes.DECIMAL(10,1)
	},
}, {
	freezeTableName: true
});

(async () => {
	// await sequelize.sync({alter: true})
})();

module.exports = Vote