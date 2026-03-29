const mongoose = require('mongoose');

const variableSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['texto', 'fecha', 'numero', 'texto_largo', 'moneda'],
    default: 'texto'
  },
  requerido: {
    type: Boolean,
    default: true
  },
  descripcion: {
    type: String,
    default: ''
  }
}, { _id: false });

const plantillaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  categoria: {
    type: String,
    enum: ['decreto', 'resolucion', 'petitorio', 'oficio', 'nota', 'demanda', 'contestacion', 'recurso', 'escrito', 'otro'],
    default: 'escrito'
  },
  fuero: {
    type: String,
    enum: ['penal', 'civil', 'laboral', 'familia', 'comercial', 'administrativo', 'general'],
    default: 'general'
  },
  contenido: {
    type: String,
    required: true
  },
  variables: [variableSchema],
  ejemplo: {
    type: String,
    default: ''
  },
  usoMinimo: {
    type: Number,
    default: 0
  },
  usageCount: {
    type: Number,
    default: 0
  },
  activa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

plantillaSchema.index({ categoria: 1, fuero: 1 });
plantillaSchema.index({ titulo: 'text' });

module.exports = mongoose.model('Plantilla', plantillaSchema);
