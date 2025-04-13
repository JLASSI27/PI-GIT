const mongoose = require('mongoose');
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Voucher = require('../../../Models/User/voucher.model.js');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const loadTemplate = (filePath, placeholders) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    Object.keys(placeholders).forEach(key => {
        content = content.replace(`{{${key}}}`, placeholders[key]);
    });
    return content;
};

 const generateVoucher = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { email } = req.body;
        const voucherCode = crypto.randomBytes(8).toString('hex').toUpperCase();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        const templatePath = path.join(__dirname, '../../../templates/voucherMail.html');
        const emailBody = loadTemplate(templatePath, {
            VOUCHER_CODE: voucherCode,
            EXPIRY_DATE: expiryDate.toDateString(),
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to our family!',
            html: emailBody,
        };

        await transporter.sendMail(mailOptions);
        const existingUser=await User.findOne({email:email});
        const newVoucher = new Voucher({
            userId: existingUser._id,
            voucherCode,
            expiryDate,
        });
        await newVoucher.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'User registered successfully and a welcome email has been sent.',
            voucherCode,
        });
    }  catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        console.error('Error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {generateVoucher} ;
