const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    voucherCode: {
        type: String,
        required: true,
        unique: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    expired: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Voucher = mongoose.model('Voucher', voucherSchema);

module.exports = Voucher;
