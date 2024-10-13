// setup express app 
const express = require('express');
const app = express();

// set up environment variables
require('dotenv').config();
let databaseUser = process.env.DATABASE_USER;
let databasePassword = process.env.DATABASE_PASSWORD
let databaseName = process.env.DATABASE_NAME


// set up database MySQL
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: databaseUser,
    password: databasePassword,
    database: databaseName
});

// Connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});

// configure database schema if doesn't exist
let sql = 'CREATE TABLE IF NOT EXISTS citations (id INT AUTO_INCREMENT PRIMARY KEY, citation VARCHAR(255), author VARCHAR(255))';
db.query(sql, (err, result) => {
    if (err) {
        throw err;
    }
    console.log('Table created');
});

// if the table is empty
sql = 'SELECT * FROM citations';
db.query(sql, (err, result) => {
    if (err) {
        throw err;
    }
    if (result.length == 0) {
        // read citation.json
        const fs = require('fs');
        let data = fs.readFileSync('citation.json');
        let citations = JSON.parse(data);
        // insert all citations into the database
        citations.forEach(cit => {
            let citation = cit.citation.replace(/'/g, "''");
            let author = cit.auteur.replace(/'/g, "''");
            let sql = `INSERT INTO citations (citation, author) VALUES ('${citation}', '${author}')`;
            db.query(sql, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    console.log('Citation added');
                }
            });
        });
    }
});


// set up body parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// set up vjs 
app.set('view engine', 'ejs');

// routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/addCitation/:citation/:author', (req, res) => {
    let citation = req.params.citation;
    let author = req.params.author;
    let sql = `INSERT INTO citations (citation, author) VALUES ('${citation}', '${author}')`;
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Citation added');
    });
});

app.get('/api/getCitations', (req, res) => {
    // get all citations with their authors [{'citation': 'citation', 'author': 'author'}, ...]
    let sql = 'SELECT * FROM citations';
    db.query(sql, (err, result) => {
        if (err) {
            throw err;
        }
        res.send(result);
    });
});

// listen for requests
app.listen(3000);
