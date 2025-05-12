const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const generateSignature = () => {
    const canvas = createCanvas(300, 100);
    const ctx = canvas.getContext('2d');

    // Fond transparent
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Style de la signature
    ctx.strokeStyle = '#1f497d';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Dessiner une signature stylisée
    ctx.beginPath();
    ctx.moveTo(50, 70);
    ctx.quadraticCurveTo(100, 20, 150, 70);
    ctx.quadraticCurveTo(200, 120, 250, 50);
    ctx.stroke();

    // Ajouter le texte de la signature
    ctx.font = 'italic 16px Arial';
    ctx.fillStyle = '#1f497d';
    ctx.fillText('Directeur des Formations', 50, 90);

    // Sauvegarder la signature
    const signaturePath = path.join(__dirname, '../public/images/signature.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(signaturePath, buffer);
};

generateSignature();