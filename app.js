const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const path = require('path'); // ✅ Pour servir les fichiers statiques

const workshopRoutes = require('./Routes/workshop/workshoproutes');
const enrollmentRoutes = require('./Routes/workshop/enrollmentroutes');
const reviewRoutes = require('./Routes/workshop/reviewroutes');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Pour servir les fichiers statiques (images uploadées)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/workshops', workshopRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
