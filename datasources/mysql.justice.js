require('dotenv').config()
const mysql = require("mysql2");

// Create a connection to the database
const connection = mysql.createPool({
	host: process.env.MYSQL_DRUPAL_HOST,
	user: process.env.MYSQL_DRUPAL_USER,
	password: process.env.MYSQL_DRUPAL_PASSWORD,
	database: 'demcom'
});

// open the MySQL connection
connection.getConnection((error, conn) => {
	if (error) throw error;
	console.log("Successfully connected to the DemCom database.");
	connection.releaseConnection(conn)
});

module.exports = connection;