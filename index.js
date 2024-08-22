const express = require('express');
const mysql = require('mysql2');
const app = express();
require('dotenv').config(); // Load environment variables

app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('Database connected');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).send({ message: 'Please fill all the fields' });
    }

    const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    const values = [name, address, latitude, longitude];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting school:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        return res.json({ msg: 'School added', schoolId: result.insertId });
    });
});

app.get('/school', (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).send({ message: 'Please fill all the fields' });
    }

    const sql = 'SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM schools HAVING distance < 50 ORDER BY distance';
    const values = [latitude, longitude, latitude];

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error querying schools:', err);
            return res.status(500).send({ message: 'Database query error' });
        }
        res.json(results);
    });
});
