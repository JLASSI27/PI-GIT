const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const generateLogo = () => {
    const canvas = createCanvas(300, 100);
    const ctx = canvas.getContext('2d');

    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texte ESPRIT
    ctx.fillStyle = '#1f497d';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EVENTO', canvas.width/2, canvas.height/2);

    // Sauvegarder le logo
    const logoPath = path.join(__dirname, '../public/images/logo.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(logoPath, buffer);
};

generateLogo();