const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);