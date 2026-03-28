const mongoose = require('mongoose');

const plantillaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    enum: ['escrito', 'recurso', 'petitorio', 'oficio', 'nota', 'otro'],
    default: 'escrito'
  },
  contenido: {
    type: String,
    required: true
  },
  variables: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Plantilla', plantillaSchema);
