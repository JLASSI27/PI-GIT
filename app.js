const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
require('./Controllers/UserControllers/Auth/googleAuth.controller');
const connectDB = require("./config/db");

const depotRoutes = require('./Routes/routesJL/depotRoutes');
const materielRoutes = require('./Routes/routesJL/materielRoutes');
const errorHandler = require('./Middlewares/middlewaresJL/errorHandler');
const indexRoutes = require("./index.routes");

const app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Test Routes
app.get('/test', (req, res) => {
    res.send('Serveur fonctionnel !');
});
app.get('/test-error', (req, res) => {
    throw new Error('Ceci est une erreur de test');
});
app.get("/", (req, res) => {
    res.send('<a href="/auth/google">auth with google</a>');
});

connectDB();

app.use("/", indexRoutes);
app.use('/api/depots', depotRoutes);
app.use('/api/materiels', materielRoutes);



app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});

module.exports = app;
