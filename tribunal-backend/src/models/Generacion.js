const mongoose = require('mongoose');

const documentoOriginalSchema = new mongoose.Schema({
  nombre: String,
  tipo: String,
  textoExtraido: String
}, { _id: false });

const partesSchema = new mongoose.Schema({
  actor: String,
  demandado: String,
  abogadoActor: String,
  abogadoDemandado: String
}, { _id: false });

const fechasSchema = new mongoose.Schema({
  presentacion: String,
  sentencia: String
}, { _id: false });

const domiciliosSchema = new mongoose.Schema({
  actor: String,
  demandado: String
}, { _id: false });

const datosExtraidosSchema = new mongoose.Schema({
  tipoEscritura: String,
  fuero: String,
  expediente: String,
  caratula: String,
  juzgado: String,
  partes: partesSchema,
  fechas: fechasSchema,
  acciones: [String],
  objetoProcesal: String,
  domicilios: domiciliosSchema
}, { _id: false });

const generacionSchema = new mongoose.Schema({
  documentoOriginal: {
    type: documentoOriginalSchema,
    required: true
  },
  datosExtraidos: {
    type: datosExtraidosSchema,
    required: true
  },
  plantillaUtilizada: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plantilla'
  },
  escritoGenerado: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['borrador', 'revisado', 'aprobado', 'descartado'],
    default: 'borrador'
  },
  usuario: {
    type: String,
    default: 'anonymous'
  },
  observaciones: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

generacionSchema.index({ estado: 1 });
generacionSchema.index({ usuario: 1 });
generacionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Generacion', generacionSchema);
