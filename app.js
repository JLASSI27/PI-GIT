const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const depotRoutes = require('./Routes/routesJL/depotRoutes');
const materielRoutes = require('./Routes/routesJL/materielRoutes');
const errorHandler = require('./Middlewares/middlewaresJL/errorHandler');

const app = express();
mongoose.set('debug', true);

// Middleware
app.use(express.json());
app.use(errorHandler);

app.use((req, res, next) => {
    console.log(`Requête reçue : ${req.method} ${req.url}`);
    next();
});
app.get('/test', (req, res) => {
    res.send('Serveur fonctionnel !');
});
app.get('/test-error', (req, res) => {
    throw new Error('Ceci est une erreur de test');
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Base de données
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

// Routes
app.use('/api/depots', depotRoutes);
app.use('/api/materiels', materielRoutes);

// Gestion des erreurs
app.use(errorHandler);

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`🚀 Serveur sur le port ${PORT}`));