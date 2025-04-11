const { User } = require('../../../Models/User/user.model');
const jwt = require('jsonwebtoken');

const verifyCode = async (req, res) => {
    const { email, code } = req.body;

    try {
        const existingUser = await User.findOne({email:email});

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(existingUser);
        const codeExpiration = existingUser.codeExpiration ? new Date(existingUser.codeExpiration) : null;

        console.log(codeExpiration);
        if (!codeExpiration || new Date() > codeExpiration) {
            return res.status(404).json({ message: 'Verification code not found or expired' });
        }

        if (existingUser.verificationCode === code) {
            existingUser.verificationCode = null;
            existingUser.verificationCodeExpiration = null;
            await existingUser.save();
            const token = jwt.sign(
                { userId: existingUser._id },  
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.status(200).json({ message: 'Code verified successfully', token });
        } else {
            return res.status(400).json({ message: 'Incorrect verification code' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = verifyCode;
