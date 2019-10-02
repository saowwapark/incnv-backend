const express = require('express');
const db = require('../util/database');
const router = express.Router();
const Sampleset = require('../models/sampleset');
const checkAuth = require('../middleware/check-auth');
const userController = require('../controllers/user');
const mysql = require('mysql2');

router.get('/count-samplesets', async (req, res) => {
  const userId = userController.getUserId(req),
    search = `%${req.query.search || ''}%`;
  const sql = mysql.format(
    'SELECT COUNT(*) AS total FROM sampleset WHERE user_id = ? AND name LIKE ?',
    [userId, search]
  );
  console.log(sql);
  const [rows] = await db.query(sql);

  res.status(200).json({
    payload: rows[0].total
  });
});

router.get('/find-samplesets', checkAuth, async (req, res) => {
  const queryParams = req.query;

  const search = `%${queryParams.search || ''}%`,
    // sortOrder = queryParams.sortOrder,
    pageNumber = parseInt(queryParams.pageNumber) || 0,
    pageSize = parseInt(queryParams.pageSize);

  const initialPos = pageNumber * pageSize;

  const userId = userController.getUserId(req);
  const post = [userId, search, initialPos, pageSize];
  const sql = mysql.format(
    'SELECT * FROM sampleset WHERE user_id = ? AND name LIKE ? ORDER BY create_date DESC LIMIT ?, ?',
    post
  );
  console.log(sql);
  const [rows] = await db.query(sql);

  const samplesets = [];
  rows.forEach(row => {
    const sampleset = new Sampleset(row);
    samplesets.push(sampleset);
  });
  res.status(200).json({
    payload: samplesets
  });
});

router.post('/add-sampleset', async (req, res) => {
  console.log('add-sampleset');
  const body = req.body;

  const userId = userController.getUserId(req),
    name = body.name,
    description = body.description,
    samples = JSON.stringify(body.samples);
  const post = [userId, name, description, samples];
  const sql = mysql.format(
    `INSERT INTO sampleset (
        user_id, name, description, samples, create_date) 
      VALUES(?, ?, ?, ?, NOW())`,
    post
  );
  console.log(sql);
  const [rows] = await db.query(sql);
  console.log(rows);
  res.status(200).json({
    payload: rows[0]
  });
});

router.put('/edit-sampleset', async (req, res) => {
  console.log('edit-sampleset');
  const body = req.body;

  const samplesetId = body.samplesetId,
    name = body.name,
    description = body.description,
    samples = JSON.stringify(body.samples);
  const post = [name, description, samples, samplesetId];
  const sql = mysql.format(
    `UPDATE sampleset 
      SET   name = ?,
            description = ?,
            samples = ?,
            modify_date = NOW() 
      WHERE sampleset_id = ?`,
    post
  );
  console.log(sql);
  const [rows] = await db.query(sql);
  console.log(rows);
  res.status(200).json({
    payload: rows[0]
  });
});

router.delete('/:samplesetId', async (req, res) => {
  console.log('delete-sampleset');
  const samplesetId = req.params.samplesetId;
  const sql = mysql.format(
    `DELETE FROM sampleset 
      WHERE sampleset_id = ?`,
    [samplesetId]
  );
  console.log(sql);
  const [rows] = await db.query(sql);
  console.log(rows);
  res.status(200).json({
    payload: rows[0]
  });
});
module.exports = router;
