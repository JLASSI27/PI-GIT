const {User} = require("../../../Models/User/user.model");
const bcrypt = require("bcrypt");
const { generateVoucher } = require("../voucher/generateVoucher.controller");
const {number} = require("yup");

const register = async (req, res) => {
    const { firstName, lastName, email, password,number } = req.body

    try {
        const existingEmail = await User.findOne({ email: email })
        if (existingEmail) {
            res.status(400).json({ message: 'Mail already exists' })
            return
        }
        const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
        const user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            number:number,
            role:"organisateur",
        })
        await user.save()
    res.status(201).json(user)

    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });

    }


}
module.exports = register;