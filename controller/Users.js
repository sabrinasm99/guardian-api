const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const util = require('util');
const connection = mysql.createConnection({
  host: '34.66.21.143',
  user: 'test',
  password: process.env.USER_PASSWORD,
  database: 'violence-detection',
});

connection.connect((err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Connected');
});

const query = util.promisify(connection.query).bind(connection);

exports.register = async function (req, res) {
  try {
    const { username, password } = req.body;
    if (!username.length || !password.length)
      return res
        .status(400)
        .json({ message: 'Username and password must be filled' });
    const result = await query(
      `SELECT * FROM users WHERE username = '${username}'`
    );
    if (result.length)
      return res.status(400).json({ message: 'Username already exist' });
    const hash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (username, password) VALUES ('${username}', '${hash}')`
    );
    res.status(200).json({
      message: 'Account created',
      data: { username, password: hash },
    });
  } catch (error) {
    return error.message;
  }
};

exports.login = async function (req, res) {
  try {
    const { username, password } = req.body;
    if (!username.length || !password.length)
      return res
        .status(400)
        .json({ message: 'Username and password must be filled' });
    const result = await query(
      `SELECT * FROM users WHERE username = '${username}'`
    );
    // console.log(result);
    if (!result.length)
      return res.status(400).json({ message: 'Failed login' });
    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.status(400).json({ message: 'Failed login' });
    const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    return error.message;
  }
};
