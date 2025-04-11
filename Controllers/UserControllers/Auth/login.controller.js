const { User } = require('../../../Models/User/user.model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { sendVerificationMail } = require("./mailVerification.controller");
const nodemailer = require("nodemailer");
const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const login = async (req, res) => {
    const { email, password, choice } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!existingUser.isVerified && existingUser.role === 'organisateur') {
            return res.status(401).json({ message: 'Please wait for admin verification.' });
        }

        if (!existingUser.isVerified) {
            await sendVerificationMail();
            return res.status(401).json({ message: 'User is not verified' });
        }

        const isAuthed = await bcrypt.compare(password, existingUser.password);
        if (!isAuthed) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        function generateCode() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }

        const code = generateCode();
        const expirationTime = new Date(Date.now() + 60 * 10000);

        existingUser.verificationCode = code;
        existingUser.codeExpiration = expirationTime;
        await existingUser.save();

        if (choice === "whatsapp") {
            client.messages
                .create({
                    from: 'whatsapp:+14155238886',
                    contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
                    contentVariables: `{"1":"${code}"}`,
                    to: `whatsapp:+216${existingUser.number}`,
                })
                .then(message => {
                    console.log(message.sid);
                    res.status(200).json({ message: 'Message sent via WhatsApp' });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send WhatsApp message' });
                });
            return;
        } else if (choice === "phone") {
            client.messages
                .create({
                    body: `Your verification code is: ${code}`,
                    from: '+19163144297',
                    to: `+216${existingUser.phone}`,
                })
                .then(() => {
                    res.status(200).json({ message: 'Verification code sent via phone' });
                })
                .catch(error => {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send SMS' });
                });
            return;
        } else if (choice === "email") {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: existingUser.email,
                subject: "Verification code",
                text: `Your verification code is: ${code}`,
            });
            return res.status(200).json({ message: 'Verification code sent via email' });
        } else {
            return res.status(400).json({ message: 'Invalid choice' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = login;
