require('dotenv').config()
const Sequelize = require('sequelize');

let database = new Sequelize('justice', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
		host: process.env.MYSQL_HOST,
		dialect: 'mysql',
		pool: {
			max: 5,
			min: 0,
			idle: 10000,
		}
	},
);

(async () => {
	if (process.env.NODE_ENV === 'development') await database.sync();
})();

module.exports = database;
