const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../util/database');

exports.getUserId = req => {
  const token = req.headers.authorization.split(' ')[1];
  const userId = jwt.decode(token, 'secret_this_should_be_longer').userId;

  return userId;
};

exports.createUser = async (req, res, next) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const post = {
    create_date: new Date(),
    email: req.body.email,
    password: hash
  };
  const sql = 'INSERT INTO user SET ?';
  try {
    const [rows] = await db.query(sql, post);
    res.status(201).json({
      message: `User created: ${rows.insertId}`,
      result: rows
    });
  } catch (err) {
    res.status(500).json({
      error: err
    });
  }
};

exports.login = async (req, res, next) => {
  const input = req.body;
  const sql = 'SELECT * FROM user WHERE email = ?';
  const [rows] = await db.query(sql, input.email);

  try {
    const fetchedUser = rows[0];
    if (!fetchedUser) {
      return res.status(401).json({
        message: `Don't ${input.email} in this system.`
      });
    }
    console.log(`This system has user: ${fetchedUser.email}`);

    const isPasswordCorrected = await bcrypt.compare(
      input.password,
      fetchedUser.password
    );
    if (!isPasswordCorrected) {
      console.log('password is incorrect');

      return res.status(401).json({
        message: 'Password is not corrected.'
      });
    }

    const token = jwt.sign(
      {
        email: fetchedUser.email,
        userId: fetchedUser.user_id
      },
      'secret_this_should_be_longer',
      { expiresIn: '1h' }
    );
    res.status(200).json({
      // 'expiresIn' in numeric value is interpreted as secondes count
      // (but string value "3600" will mean millisecond)
      expiresIn: 3600,
      token,
      userId: fetchedUser.user_id
    });
  } catch (err) {
    return res.status(401).json({
      message: 'Auth failed'
    });
  }
};
