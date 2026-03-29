const Plantilla = require('../models/Plantilla');

const CATEGORIAS_TIPO = {
  'decreto': 'decreto',
  'resolucion': 'resolucion',
  'petitorio': 'petitorio',
  'oficio': 'oficio',
  'nota': 'nota',
  'demanda': 'demanda',
  'contestacion': 'contestacion',
  'recurso': 'recurso',
  'escrito': 'escrito',
  'otro': 'otro'
};

function extractVariables(plantilla) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(plantilla.contenido)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

function fillTemplate(template, data) {
  let filled = template.contenido;
  
  const replacements = {
    expediente: data.expediente,
    caratula: data.caratula,
    juzgado: data.juzgado,
    actor: data.partes?.actor,
    demandado: data.partes?.demandado,
    abogado_actor: data.partes?.abogadoActor,
    abogado_demandado: data.partes?.abogadoDemandado,
    domicilio_actor: data.domicilios?.actor,
    domicilio_demandado: data.domicilios?.demandado,
    fecha_presentacion: data.fechas?.presentacion,
    fecha_sentencia: data.fechas?.sentencia,
    objeto_procesal: data.objetoProcesal,
    tipo_escritura: data.tipoEscritura,
    fuero: data.fuero
  };

  for (const [key, value] of Object.entries(replacements)) {
    if (value) {
      filled = filled.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
  }

  filled = filled.replace(/\{\{[^}]+\}\}/g, '[PENDIENTE]');
  
  return filled;
}

function calculateCompletitud(template, data) {
  const variables = extractVariables(template);
  let filled = 0;
  let pending = [];

  for (const variable of variables) {
    const dataValue = getNestedValue(data, variable);
    if (dataValue) {
      filled++;
    } else {
      pending.push(variable);
    }
  }

  return {
    total: variables.length,
    filled,
    pending,
    percentage: variables.length > 0 
      ? Math.round((filled / variables.length) * 100) 
      : 100
  };
}

function getNestedValue(obj, path) {
  const keys = path.split('_');
  let value = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return null;
    }
  }
  
  return value || null;
}

async function findBestTemplate(data) {
  const tipoEscritura = data.tipoEscritura?.toLowerCase() || 'otro';
  const fuero = data.fuero?.toLowerCase() || null;

  let query = {};
  
  if (CATEGORIAS_TIPO[tipoEscritura]) {
    query.categoria = CATEGORIAS_TIPO[tipoEscritura];
  }

  let templates = await Plantilla.find(query).sort({ usageCount: -1, createdAt: -1 });
  
  if (templates.length === 0) {
    templates = await Plantilla.find().sort({ usageCount: -1, createdAt: -1 });
  }
  
  if (fuero && templates.length > 0) {
    const byFuero = templates.filter(t => 
      t.fuero && t.fuero.toLowerCase() === fuero
    );
    if (byFuero.length > 0) {
      templates = byFuero;
    }
  }

  return templates.length > 0 ? templates[0] : null;
}

async function incrementUsage(plantillaId) {
  try {
    await Plantilla.findByIdAndUpdate(plantillaId, {
      $inc: { usageCount: 1 }
    });
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}

async function getTemplatesGroupedByCategory() {
  const templates = await Plantilla.find().sort({ categoria: 1, titulo: 1 });
  
  const grouped = templates.reduce((acc, template) => {
    const categoria = template.categoria || 'otro';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(template);
    return acc;
  }, {});

  return grouped;
}

async function getVariablesCatalog() {
  return {
    expediente: { type: 'text', description: 'Número de expediente judicial' },
    caratula: { type: 'text', description: 'Nombre completo del caso' },
    juzgado: { type: 'text', description: 'Número de juzgado' },
    actor: { type: 'text', description: 'Nombre del actor/demandante' },
    demandado: { type: 'text', description: 'Nombre del demandado' },
    abogado_actor: { type: 'text', description: 'Abogado del actor' },
    abogado_demandado: { type: 'text', description: 'Abogado del demandado' },
    domicilio_actor: { type: 'text', description: 'Domicilio del actor' },
    domicilio_demandado: { type: 'text', description: 'Domicilio del demandado' },
    fecha_presentacion: { type: 'date', description: 'Fecha de presentación' },
    fecha_sentencia: { type: 'date', description: 'Fecha de sentencia' },
    objeto_procesal: { type: 'textarea', description: 'Objeto del proceso' },
    fojas: { type: 'number', description: 'Número de fojas' },
    ciudad: { type: 'text', description: 'Ciudad del tribunal' },
    juez: { type: 'text', description: 'Nombre del juez' },
    tipo_accion: { type: 'text', description: 'Tipo de acción judicial' },
    monto: { type: 'currency', description: 'Monto en disputa' }
  };
}

module.exports = {
  extractVariables,
  fillTemplate,
  calculateCompletitud,
  findBestTemplate,
  incrementUsage,
  getTemplatesGroupedByCategory,
  getVariablesCatalog,
  CATEGORIAS_TIPO
};
