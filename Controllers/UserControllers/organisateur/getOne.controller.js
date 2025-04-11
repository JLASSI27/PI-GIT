const {  User } = require("../../../Models/User/user.model");

const getOne = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
module.exports = getOne;