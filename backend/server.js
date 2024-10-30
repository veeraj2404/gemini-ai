// server.js
const express = require('express');
const cors = require('cors'); // Import cors
require('dotenv').config(); // To use .env variables
const bodyParser = require('body-parser');
const connectDB = require('./connection/db'); 

const app = express();
const port = 3001;

connectDB();

const authRoute = require('./routes/auth');
const apiRoute = require('./routes/api');

// Middleware
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000', // Only allow requests from this origin
}));
// Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies


//Route
app.use('/', authRoute)
app.use('/task', apiRoute)

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
