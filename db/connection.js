const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Connected');
});

const query = util.promisify(connection.query).bind(connection);

module.exports = query;
