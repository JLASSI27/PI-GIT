const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();
require('./Controllers/UserControllers/Auth/googleAuth.controller')
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const indexRoutes = require("./index.routes");
const passport = require("passport");

const app = express();

app.get("/",  (req, res)=> {
    res.send('<a href="/auth/google">auth with google</a>')
})


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
connectDB()
module.exports = app;
