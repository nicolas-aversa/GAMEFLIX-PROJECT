const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameSchema = new Schema ({
    title: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
    price: {type: Number, required: true, min: 0},
    os: {type: String, required: true, enum: ['Windows', 'Linux', 'Mac']},
    language: {type: String, required: true, enum: ['Español', 'Inglés']},
    playersQty: {type: String, required: true, enum: ['Single-player', 'Multi-player']},
    minimumRequirements: {
        cpu: {type: String, required: true},
        memory: {type: String, required: true},
        gpu: {type: String, required: true}
    },
    recommendedRequirements: {
        cpu: {type: String, required: true},
        memory: {type: String, required: true},
        gpu: {type: String, required: true}
    },
    status: {type: String, required: true, enum: ['Publicado', 'Despublicado'], default: 'Despublicado'},
    developer: {type: Schema.Types.ObjectId, ref: 'Developer', required: true},
    review: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    wishlistCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now},
    imageUrl: { type: String, required: true }
});

// Middleware para actualizar updatedAt y conversionRate antes de cada save
gameSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.views > 0) {
      this.conversionRate = (this.purchases / this.views) * 100;
    } else {
      this.conversionRate = 0;
    }
    next();
  });

module.exports = mongoose.model('Game', gameSchema);