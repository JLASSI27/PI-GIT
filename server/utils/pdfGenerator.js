const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Récupération des variables d'environnement avec valeurs par défaut
const {
    CERTIFICATE_BACKGROUND_COLOR = '#ffffff',
    CERTIFICATE_PRIMARY_COLOR = '#1f497d',
    CERTIFICATE_SECONDARY_COLOR = '#2e75b6',
    DIGITAL_SIGNATURE = 'Directeur des Formations - ESPRIT'
} = process.env;

const generateCertificate = async (userName, workshopTitle, outputPath) => {
    // Création du document PDF
    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margin: 0
    });

    // Flux de sortie
    doc.pipe(fs.createWriteStream(outputPath));

    // Ajout du fond avec la couleur depuis .env
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(CERTIFICATE_BACKGROUND_COLOR);

    // Ajout du logo
    const logoPath = path.join(__dirname, '../public/images/logo.png');
    doc.image(logoPath, 30, 30, { width: 100 });

    // Ajout de la bordure décorative
    doc.lineWidth(3);
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .stroke(CERTIFICATE_PRIMARY_COLOR);

    // Titre principal avec la couleur primaire
    doc.font('Helvetica-Bold')
        .fontSize(40)
        .fillColor(CERTIFICATE_PRIMARY_COLOR)
        .text('CERTIFICAT DE RÉUSSITE', doc.page.width / 2, 100, {
            align: 'center'
        });

    // Sous-titre
    doc.font('Helvetica')
        .fontSize(16)
        .fillColor('#666666')
        .text('Ce certificat est décerné à', doc.page.width / 2, 180, {
            align: 'center'
        });

    // Nom du participant avec la couleur secondaire
    doc.font('Helvetica-Bold')
        .fontSize(30)
        .fillColor(CERTIFICATE_SECONDARY_COLOR)
        .text(userName, doc.page.width / 2, 220, {
            align: 'center'
        });

    // Description
    doc.font('Helvetica')
        .fontSize(16)
        .fillColor('#666666')
        .text(
            `pour avoir complété avec succès le workshop\n"${workshopTitle}"`,
            doc.page.width / 2,
            280,
            { align: 'center' }
        );

    // Date
    const date = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    doc.text(`Délivré le ${date}`, doc.page.width / 2, 340, {
        align: 'center'
    });

    // Signature numérique (avec gestion de l'absence du fichier)
    const signaturePath = path.join(__dirname, '../public/images/signature.png');
    if (fs.existsSync(signaturePath)) {
        doc.image(signaturePath, doc.page.width - 250, doc.page.height - 150, {
            width: 150
        });
    }

    // Nom du signataire
    doc.font('Helvetica-Bold')
        .fontSize(14)
        .text(DIGITAL_SIGNATURE, doc.page.width - 250, doc.page.height - 80);

    // QR Code (avec gestion de l'absence du fichier)
    const qrCodePath = path.join(__dirname, '../public/images/qr-code.png');
    if (fs.existsSync(qrCodePath)) {
        doc.image(qrCodePath, 70, doc.page.height - 150, {
            width: 100
        });
    }

    // Code de vérification
    const verificationCode = generateVerificationCode(userName, workshopTitle);
    doc.font('Helvetica')
       .fontSize(10)
       .text('Code de vérification:', 50, doc.page.height - 40)
       .font('Courier')
       .text(verificationCode);

    // Finalisation du document
    doc.end();
};

// Fonction pour générer un code de vérification unique
const generateVerificationCode = (userName, workshopTitle) => {
    const crypto = require('crypto');
    return crypto
        .createHash('sha256')
        .update(`${userName}${workshopTitle}${Date.now()}`)
        .digest('hex')
        .substring(0, 8)
        .toUpperCase();
};

module.exports = generateCertificate;




