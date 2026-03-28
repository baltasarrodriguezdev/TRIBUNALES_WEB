const mongoose = require('mongoose');

const tasaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  unidad: {
    type: String,
    default: 'anual'
  },
  vigente: {
    type: Boolean,
    default: true
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tasa', tasaSchema);
