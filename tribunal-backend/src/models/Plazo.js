const mongoose = require('mongoose');

const plazoSchema = new mongoose.Schema({
  expedienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expediente'
  },
  descripcion: {
    type: String,
    required: true
  },
  fechaLimite: {
    type: Date,
    required: true
  },
  tipo: {
    type: String,
    enum: ['habil', 'corrido'],
    default: 'habil'
  },
  estado: {
    type: String,
    enum: ['pendiente', 'vencido', 'cumplido'],
    default: 'pendiente'
  },
  prioridad: {
    type: String,
    enum: ['alta', 'media', 'baja'],
    default: 'media'
  },
  observaciones: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Plazo', plazoSchema);
