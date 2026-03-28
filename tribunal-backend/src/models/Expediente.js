const mongoose = require('mongoose');

const expedienteSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  caratula: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'archivado', 'pausado'],
    default: 'activo'
  },
  jurisdiccion: {
    type: String,
    enum: ['Civil', 'Penal', 'Laboral', 'Comercial', 'Familia', 'Contencioso Administrativo', 'Otro'],
    default: 'Civil'
  },
  fuero: String,
  observaciones: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Expediente', expedienteSchema);
