const jwt = require('jsonwebtoken');
const {User} = require('../../Models/User/user.model');

const isAll = async (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findOne({ _id: decoded.userId });
        console.log('User found:', user);

        if (!user) {
            return res.status(403).json({ message: 'Access denied. You are not a user.' });
        }
        req.user = user;

        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = isAll