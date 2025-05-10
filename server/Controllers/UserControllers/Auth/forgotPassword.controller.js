const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { User } = require("../../../Models/User/user.model");
const bcrypt = require("bcrypt");

const forgotPassword = async (req, res) => {
    const { email,newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const token = jwt.sign({ id: user._id,password:newPassword }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
        });

        res.status(200).json({ message: "Reset link sent to email" });
    } catch {
        res.status(500).json({ message: "Server error" });
    }
};
const changePassword = async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        const user = await User.findById(decoded.id);
        console.log(user);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.password = await bcrypt.hash(decoded.password, 10);
        await user.save();

        res.redirect('http://localhost:4200/login')
    } catch {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

module.exports = {forgotPassword,changePassword};
