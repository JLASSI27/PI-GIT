const Voucher = require('../../../Models/User/voucher.model.js');
const dotenv = require('dotenv');

dotenv.config();

const verifyVoucher = async (req, res) => {
    try {
        const { voucher } = req.body;
        const existingVoucher = await Voucher.findOne({ voucherCode: voucher });
        if (!existingVoucher) {
            return res.status(404).send({ message: 'Invalid voucher' });
        }
        const currentDate = new Date();
        if (existingVoucher.expiryDate < currentDate) {
            if (!existingVoucher.expired) {
                existingVoucher.expired = true;
                await existingVoucher.save();
            }
            return res.status(404).send({ message: 'Voucher has expired' });
        }
        if (existingVoucher.expired) {
            return res.status(404).send({ message: 'Voucher is already used' });
        }
        return res.status(200).send({ message: 'Voucher is valid' });
    } catch (error) {
        return res.status(500).send({ message: 'Server error' });
    }
};

export default verifyVoucher;