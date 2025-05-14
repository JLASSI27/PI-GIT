const multer = require('multer');
const path = require('path');

// Dossier de destination pour les images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/images/'); // Assure-toi que ce dossier existe
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

module.exports = upload;
