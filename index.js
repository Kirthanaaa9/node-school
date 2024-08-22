const express=require('express');
const mysql=require('mysql2');
const app=express();
app.use(express.json());
const db=mysql.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'RaYa@6672',
    database:'school_management'
});
db.connect((err)=>{if(err){
    throw err;
}
console.log('mysql connected');});
app.listen(3000,()=>{console.log('server strated on port 3000')});
app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;
    if (!name || !address || !latitude || !longitude) {
        return res.status(400).send({ message: 'Please fill all the fields' });
    }

    // Specify columns to insert
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

app.get('/school',(req,res)=>{
    const {latitude,longitude}=req.query;
    if(!latitude||!longitude){
        return res.status(400).send({message:'Please fill all the fields'});
    }
    const sql = 'SELECT *, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance FROM schools HAVING distance < 50 ORDER BY distance';
    const values = [latitude, longitude, latitude];
    db.query(sql,values,(err,results)=>{
        if(err){throw err;}
res.json(results);
    })
})
