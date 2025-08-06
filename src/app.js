const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const userRoutes = require('./routes/user.routes.js');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/api/v1/users', userRoutes);

module.exports = { app };