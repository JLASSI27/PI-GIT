const { validateUser, User } = require("../../../Models/User/user.model");
const bcrypt = require("bcrypt");
const { sendVerificationMail } = require("../Auth/mailVerification.controller");

const register = async (req, res) => {
    const { firstName, lastName, email, password, number } = req.body;

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
                message: 'Échec de la validation',
                errors: validation.errors
            });
        }

        const existingEmail = await User.findOne({ email: email });
        if (existingEmail) {

            await sendVerificationMail(existingEmail)
            return res.status(400).json({ message: 'L\'email existe déjà (vérifiez votre email)' });
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
            message: "Inscription réussie ! Veuillez vérifier votre email pour valider votre compte."
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};

module.exports = register;
