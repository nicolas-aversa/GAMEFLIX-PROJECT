const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  cardNumber: { type: String, required: true, match: /^[0-9]{16}$/, minlength: 16, maxlength: 16 },
  cardProvider: { type: String, required: true, enum: ['Visa', 'Mastercard', 'AMEX'] },
  cardExpDate: { type: String, required: true, match: /^(0[1-9]|1[0-2])\/([0-9]{2})$/ },
  cardCVC: { type: String, required: true, match: /^[0-9]{3,4}$/, minlength: 3, maxlength: 4 },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
});

module.exports = mongoose.model('Payment', paymentSchema);