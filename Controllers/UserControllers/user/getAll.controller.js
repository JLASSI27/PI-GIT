const {  User } = require("../../../Models/User/user.model");

const getAll = async (req, res) => {
    try {
        const users = await User.find({role:'user'})
        return res.status(200).json(
            users
        );
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};
module.exports = getAll;