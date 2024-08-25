const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'mysql-1e7793b5-kirthanaaa9-bd10.h.aivencloud.com',
    port: 13415,                // Port from your database configuration
    user: 'avnadmin',
    password: 'AVNS_1VB9c3tVo5AWWhW3Ccv',
    database: 'defaultdb',
    // ssl: { rejectUnauthorized: false } // Uncomment if SSL is needed
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('Database connected');
});

// Server port
const PORT = process.env.PORT || 3000; // Default port for Express server

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// Add a school
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

// Get schools within 50 km
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
