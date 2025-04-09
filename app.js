const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
var morgan = require('morgan')
const configDb = require("./config/db.json");

require('dotenv').config();

const blogRouter = require('./Routes/blogRouters');
const commentRouter = require('./Routes/commentRouters');
const chatbotRouter = require('./Routes/chatbotRouter');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"))
app.use('/img', express.static('public/images'));

app.use('/api/chatbot', chatbotRouter);
app.use('/blog', blogRouter);
app.use('/comment', commentRouter);

mongoose.connect(configDb.mongo.uri)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});