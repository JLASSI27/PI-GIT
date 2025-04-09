const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
var morgan = require('morgan')
const configDb = require("./config/db.json");

require('dotenv').config();

const blogRouter = require('./routers/blogRouters');
const commentRouter = require('./routers/commentRouters');
const chatbotRouter = require('./routers/chatbotRouter');

const app = express();
const server = http.createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

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


const io = require('socket.io')(server);
io.on("connection", (socket) => {
    console.log("a user is connected");
});


server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
