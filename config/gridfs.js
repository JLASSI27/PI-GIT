require('dotenv').config(); // pour s'assurer que l'URI est bien disponible
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Connexion spécifique pour GridFS
const conn = mongoose.createConnection(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('contracts'); // nom de la collection GridFS
  console.log('GridFS initialisé !');
});

module.exports = { conn, gfs };
