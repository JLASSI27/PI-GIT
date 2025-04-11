const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {generateVoucher} = require("../voucher/generateVoucher.controller");
const {User} = require("../../../Models/User/user.model");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendVerificationMail=async (user)=>{
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
    const verificationLink = `http://localhost:3000/verify?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Verify Your Email",
        text: `Please click this link to verify your email: ${verificationLink}`
    });

}
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        console.log(user);

        if (!user) {
            return res.status(400).json({ message: "Invalid token" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }

        user.isVerified = true;
        await user.save();

        await generateVoucher({ body: { email: user.email } }, res);



    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token",
            error: error.message
        });
    }
};

module.exports = {sendVerificationMail,verifyEmail};