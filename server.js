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
    "http://localhost:3000",
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
    connectionLimit: 10,
    queueLimit: 0,
};

// GET all assignments
app.get('/allassignments', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'SELECT id, module_name, assignment_title, status FROM assignments'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allassignments' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Backend running on port ${port}`);
});
