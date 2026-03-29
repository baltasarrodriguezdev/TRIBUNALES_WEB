const { extractText, cleanText } = require('./documentParser');
const llmService = require('./llmService');
const templateService = require('./templateService');
const extractionService = require('./extractionService');
const Generacion = require('../models/Generacion');

async function processDocument(file, opciones = {}) {
  const startTime = Date.now();
  
  let textoExtraido;
  try {
    const resultado = await extractText(file);
    textoExtraido = cleanText(resultado.text);
  } catch (error) {
    throw new Error(`Error extrayendo texto: ${error.message}`);
  }

  if (!textoExtraido || textoExtraido.length < 50) {
    throw new Error('El documento no contiene suficiente texto para analizar');
  }

  let datosExtraidos;
  let extractionMetadata = null;
  
  try {
    const categoria = opciones.categoria || 'otro';
    const result = await extractionService.hybridExtract(textoExtraido, categoria, opciones);
    
    if (result.success) {
      datosExtraidos = extractionService.convertToLegacyFormat(result);
      extractionMetadata = result.metadata;
    } else {
      datosExtraidos = {
        tipoEscritura: 'otro',
        fuero: null,
        expediente: null,
        caratula: null,
        juzgado: null,
        partes: { actor: null, demandado: null, abogadoActor: null, abogadoDemandado: null },
        fechas: { presentacion: null, sentencia: null },
        acciones: [],
        objetoProcesal: null,
        domicilios: { actor: null, demandado: null }
      };
    }
  } catch (error) {
    console.error('Error en análisis híbrido:', error);
    datosExtraidos = {
      tipoEscritura: 'otro',
      fuero: null,
      expediente: null,
      caratula: null,
      juzgado: null,
      partes: { actor: null, demandado: null, abogadoActor: null, abogadoDemandado: null },
      fechas: { presentacion: null, sentencia: null },
      acciones: [],
      objetoProcesal: null,
      errores: [error.message]
    };
  }

  let plantillaSugerida = null;
  try {
    plantillaSugerida = await templateService.findBestTemplate(datosExtraidos);
  } catch (error) {
    console.error('Error buscando plantilla:', error);
  }

  const processingTime = Date.now() - startTime;

  return {
    textoExtraido,
    datosExtraidos,
    extractionMetadata,
    plantillaSugerida: plantillaSugerida ? {
      _id: plantillaSugerida._id,
      titulo: plantillaSugerida.titulo,
      categoria: plantillaSugerida.categoria,
      contenido: plantillaSugerida.contenido.substring(0, 500) + '...'
    } : null,
    processingTime
  };
}

async function extraerDatosParaPlantilla(file, plantilla, opciones = {}) {
  const startTime = Date.now();
  
  let textoExtraido;
  try {
    const resultado = await extractText(file);
    textoExtraido = cleanText(resultado.text);
  } catch (error) {
    throw new Error(`Error extrayendo texto: ${error.message}`);
  }

  if (!textoExtraido || textoExtraido.length < 50) {
    throw new Error('El documento no contiene suficiente texto para analizar');
  }

  const categoria = plantilla.categoria || 'otro';
  
  let datosExtraidos;
  let extractionMetadata = null;
  
  try {
    const result = await extractionService.hybridExtract(textoExtraido, categoria, opciones);
    
    if (result.success) {
      datosExtraidos = extractionService.convertToLegacyFormat(result);
      extractionMetadata = result.metadata;
    } else {
      datosExtraidos = {};
    }
  } catch (error) {
    console.error('Error en análisis híbrido orientado a plantilla:', error);
    datosExtraidos = {};
  }

  const processingTime = Date.now() - startTime;

  return {
    textoExtraido,
    datosExtraidos,
    extractionMetadata,
    processingTime
  };
}

async function generateWritten(plantillaId, datosExtraidos, opciones = {}) {
  const Plantilla = require('../models/Plantilla');
  
  let plantilla;
  try {
    plantilla = await Plantilla.findById(plantillaId);
  } catch (error) {
    throw new Error('Plantilla no encontrada');
  }

  if (!plantilla) {
    throw new Error('Plantilla no encontrada');
  }

  const categoria = plantilla.categoria || 'otro';
  const completitud = templateService.calculateCompletitud(plantilla, datosExtraidos, categoria);

  if (!completitud.puedeGenerar && !opciones.forzarBorrador) {
    throw new Error(`Faltan datos críticos: ${completitud.criticos.pending.join(', ')}`);
  }

  let escritoGenerado;
  const comoBorrador = completitud.esBorrador && !opciones.forzarCompleto;

  if (opciones.useAI && opciones.useAI !== false) {
    try {
      const resultado = await llmService.generateFromTemplate(plantilla, datosExtraidos, comoBorrador);
      escritoGenerado = resultado.written;
    } catch (error) {
      console.warn('Error generando con IA, usando método simple:', error.message);
      escritoGenerado = templateService.fillTemplate(plantilla, datosExtraidos, { comoBorrador });
    }
  } else {
    escritoGenerado = templateService.fillTemplate(plantilla, datosExtraidos, { comoBorrador });
  }

  await templateService.incrementUsage(plantillaId);

  let estadoGeneracion = 'completado';
  if (completitud.estado === 'incompleto') {
    estadoGeneracion = 'incompleto';
  } else if (completitud.estado === 'borrador') {
    estadoGeneracion = 'borrador';
  }

  return {
    escritoGenerado,
    plantilla: {
      _id: plantilla._id,
      titulo: plantilla.titulo,
      categoria: plantilla.categoria
    },
    completitud,
    estado: estadoGeneracion,
    advertencia: completitud.esBorrador ? 
      `Este escrito se generó como ${completitud.estado === 'incompleto' ? 'BORRADOR INCOMPLETO' : 'borrador'} porque faltan datos recomendados. Revisar antes de presentar.` : 
      null
  };
}

async function saveGeneration(data) {
  try {
    const generacion = new Generacion({
      documentoOriginal: {
        nombre: data.nombreArchivo,
        tipo: data.tipoArchivo,
        textoExtraido: data.textoExtraido
      },
      datosExtraidos: data.datosExtraidos,
      plantillaUtilizada: data.plantillaId,
      escritoGenerado: data.escritoGenerado,
      estado: data.estado || 'borrador',
      usuario: data.usuario || 'anonymous'
    });

    await generacion.save();
    return generacion;
  } catch (error) {
    console.error('Error guardando generación:', error);
    throw new Error('Error al guardar la generación');
  }
}

async function getGeneraciones(opciones = {}) {
  const query = {};
  
  if (opciones.estado) {
    query.estado = opciones.estado;
  }
  if (opciones.usuario) {
    query.usuario = opciones.usuario;
  }

  return Generacion.find(query)
    .sort({ createdAt: -1 })
    .limit(opciones.limit || 50);
}

async function updateGeneracionEstado(id, estado) {
  const estadosValidos = ['borrador', 'revisado', 'aprobado', 'descartado', 'incompleto', 'completado'];
  
  if (!estadosValidos.includes(estado)) {
    throw new Error('Estado no válido');
  }

  return Generacion.findByIdAndUpdate(
    id,
    { estado },
    { new: true }
  );
}

module.exports = {
  processDocument,
  extraerDatosParaPlantilla,
  generateWritten,
  saveGeneration,
  getGeneraciones,
  updateGeneracionEstado
};
