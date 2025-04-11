const { validateUser, User } = require("../../../Models/User/user.model");
const bcrypt = require("bcrypt");
const {sendVerificationMail} = require("../Auth/mailVerification.controller");

const register = async (req, res) => {
    const { firstName, lastName, email, password,number } = req.body;

    try {
        const validation = await validateUser({
            firstName,
            lastName,
            email,
            password,
            number
        });

        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));

        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            number,
        });

        await user.save();
      await sendVerificationMail(user)

        return res.status(201).json({
            message: "Registration successful! Please check your email to verify your account."
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = register;