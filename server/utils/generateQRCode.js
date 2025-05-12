const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQRCode = async (text) => {
    try {
        const qrCodePath = path.join(__dirname, '../public/images/qr-code.png');
        await QRCode.toFile(qrCodePath, text, {
            color: {
                dark: '#1f497d',
                light: '#ffffff'
            },
            width: 300,
            margin: 1
        });
        console.log('QR Code généré avec succès');
    } catch (error) {
        console.error('Erreur de génération du QR Code:', error);
    }
};

// Générer un QR code avec les informations d'ESPRIT
generateQRCode('https://esprit.tn/');