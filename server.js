const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Use Render's PORT or fallback to 3001 locally
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS
const allowedOrigins = [
    "https://c219-ca2-frontend.onrender.com",
    // add your frontend domain when deployed
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow Postman/server
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// GET all assignments
app.get('/allassignments', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id, module_name, assignment_title, description, status FROM assignments'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allassignments' });
    } finally {
        if (connection) await connection.end();
    }
});

app.post('/addassignment', async (req, res) => {
    const { module_name, assignment_title, description, status } = req.body;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO assignments (module_name, assignment_title, description, status) VALUES (?, ?, ?, ?)', [module_name, assignment_title, description, status]);
        res.status(201).json({message: 'Assignment ' + assignment_title + ' added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: 'Server error - could not add assignment ' + assignment_title});
    } finally {
        if (connection) await connection.end();
    }
});

app.delete('/deleteassignment/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try{
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM assignments WHERE id = ?', [id]);
        res.status(201).json({ message: 'Assignment ' + id + ' deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete assignment ' + id });
    } finally {
        if (connection) await connection.end();
    }
});

app.put('/updateassignment/:id', async (req, res) => {
    const { id } = req.params;
    const { module_name, assignment_title, description, status } = req.body;
    let connection;
    try{
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE assignments SET module_name = ?, assignment_title = ?, description = ?, status = ? WHERE id = ?', [module_name, assignment_title, description, status, id]);
        res.status(201).json({ message: 'Assignment ' + assignment_title + ' updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update assignment ' + id });
    } finally {
        if (connection) await connection.end();
    }
});



// Start server
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
