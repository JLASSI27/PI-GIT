const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
require('./Controllers/UserControllers/Auth/googleAuth.controller');
const connectDB = require("./config/db");  // Keep original connectDB, modify if needed

const workshopRoutes = require('./Routes/workshop/workshoproutes');
const enrollmentRoutes = require('./Routes/workshop/enrollmentroutes');
const reviewRoutes = require('./Routes/workshop/reviewroutes');
const depotRoutes = require('./Routes/routesJL/depotRoutes');
const materielRoutes = require('./Routes/routesJL/materielRoutes');
const blogRouter = require('./Routes/blogr/blogRouters');
const commentRouter = require('./Routes/blogr/commentRouters');
const chatbotRouter = require('./Routes/blogr/chatbotRouter');
const errorHandler = require('./Middlewares/middlewaresJL/errorHandler');
const indexRoutes = require("./index.routes");

const app = express();

// Middleware
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));  // Serve uploaded images

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

// Database Connection
connectDB();

// Routes
app.use("/", indexRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/depots', depotRoutes);
app.use('/api/materiels', materielRoutes);
app.use('/api/chatbot', chatbotRouter);
app.use('/blog', blogRouter);
app.use('/comment', commentRouter);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
module.exports = app;
