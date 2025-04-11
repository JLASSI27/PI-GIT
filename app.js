var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//const mongoose = require("mongoose");
const connectDB = require('./config/db');
require('dotenv').config();
var produitRouter = require('./Routes/shope/produit');
var commandeRouter = require('./Routes/shope/commande');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', produitRouter);
app.use('/', commandeRouter);
//app.use('/api', commandeRouter);
app.use('/api', commandeRouter);
// Gestion des erreurs 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Gestion des erreurs globales
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
connectDB()

module.exports = app;
