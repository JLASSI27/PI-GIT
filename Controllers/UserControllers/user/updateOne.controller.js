const { User } = require("../../../Models/User/user.model");
const bcrypt = require("bcrypt");

const update = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, number } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) {
            const existingEmail = await User.findOne({ email, _id: { $ne: id } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            user.email = email;
        }
        if (number) user.number = number;

        await user.save();

        return res.status(200).json({
            message: 'User updated successfully',
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
module.exports = update;