const Plantilla = require('../models/Plantilla');
const { NIVEL_VARIABLE } = require('../models/Plantilla');

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

const VARIABLES_POR_CATEGORIA = {
  recurso: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula', 'parte_recurrente', 'abogado_recurrente', 'matricula_recurrente', 'resolucion_apelada', 'fecha_resolucion'],
    recomendados: ['parte_demandado', 'abogado_demandado', 'agravios', 'fundamentos', 'norma_invocada', 'petitorio'],
    opcionales: ['domicilio_electronico', 'telefono', 'email']
  },
  demanda: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula', 'actor', 'demandado', 'domicilio_actor', 'objeto_procesal', 'monto'],
    recomendados: ['dni_actor', 'dni_demandado', 'abogado_actor', 'matricula_actor', 'fecha_contrato', 'hechos', 'fundamentos'],
    opcionales: ['telefono', 'email', 'domicilio_electronico']
  },
  contestacion: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula', 'demandado', 'actor', 'contesta_factum', 'contesta_derecho'],
    recomendados: ['abogado_demandado', 'matricula_demandado', 'defensas', 'excepciones'],
    opcionales: ['telefono', 'email']
  },
  petitorio: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula', 'parte_peticionaria', 'medida_solicitada'],
    recomendados: ['fundamentos', 'norma_invocada', 'periculum', 'fumus', 'prueba_ofrecida'],
    opcionales: ['domicilio_electronico']
  },
  escrito: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula'],
    recomendados: ['parte', 'abogado', 'matricula'],
    opcionales: []
  },
  resolucion: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula', 'resultado', 'fecha'],
    recomendados: ['fundamentos', 'antecedentes'],
    opcionales: []
  },
  otro: {
    criticos: ['juzgado', 'ciudad', 'expediente', 'caratula'],
    recomendados: ['parte'],
    opcionales: []
  }
};

function extractVariables(plantilla) {
  const regex = /\{\{(\w+)\}\}/g;
  const variables = new Set();
  let match;
  
  while ((match = regex.exec(plantilla.contenido || '')) !== null) {
    variables.add(match[1].trim());
  }
  
  return Array.from(variables);
}

function getNivelVariable(nombre, categoria) {
  const config = VARIABLES_POR_CATEGORIA[categoria] || VARIABLES_POR_CATEGORIA.otro;
  
  if (config.criticos.includes(nombre)) return NIVEL_VARIABLE.CRITICO;
  if (config.recomendados.includes(nombre)) return NIVEL_VARIABLE.RECOMENDADO;
  return NIVEL_VARIABLE.OPCIONAL;
}

function fillTemplate(template, data, opciones = {}) {
  const { comoBorrador = false } = opciones;
  let filled = template.contenido || '';
  
  const variablesEnPlantilla = extractVariables(template);
  
  for (const [key, value] of Object.entries(data || {})) {
    if (value && value.toString().trim() !== '') {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      filled = filled.replace(regex, value);
    }
  }

  if (comoBorrador) {
    filled = filled.replace(/\{\{([^}]+)\}\}/g, '[____$1____]');
  } else {
    filled = filled.replace(/\{\{([^}]+)\}\}/g, '[[PENDIENTE: $1]]');
  }
  
  return filled;
}

function calculateCompletitud(template, data, categoria = 'otro') {
  const variablesEnPlantilla = extractVariables(template);
  
  const criticos = { filled: [], pending: [] };
  const recomendados = { filled: [], pending: [] };
  const opcionales = { filled: [], pending: [] };
  
  for (const variable of variablesEnPlantilla) {
    const nivel = getNivelVariable(variable, categoria);
    const tieneValor = data && data[variable] && data[variable].toString().trim() !== '';
    
    const destino = nivel === NIVEL_VARIABLE.CRITICO ? criticos : 
                    nivel === NIVEL_VARIABLE.RECOMENDADO ? recomendados : 
                    opcionales;
    
    if (tieneValor) {
      destino.filled.push(variable);
    } else {
      destino.pending.push(variable);
    }
  }

  const totalCriticos = criticos.filled.length + criticos.pending.length;
  const totalRecomendados = recomendados.filled.length + recomendados.pending.length;
  const total = totalCriticos + totalRecomendados + opcionales.filled.length + opcionales.pending.length;
  
  const filled = criticos.filled.length + recomendados.filled.length + opcionales.filled.length;
  
  let estado = 'completo';
  if (criticos.pending.length > 0) {
    estado = 'incompleto';
  } else if (recomendados.pending.length > 0) {
    estado = 'borrador';
  }

  return {
    total,
    filled,
    percentage: total > 0 ? Math.round((filled / total) * 100) : 100,
    criticos,
    recomendados,
    opcionales,
    estado,
    puedeGenerar: criticos.pending.length === 0,
    esBorrador: estado !== 'completo'
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
    expediente: { type: 'text', description: 'Número de expediente judicial', nivel: 'critico', seccion: 'proceso' },
    caratula: { type: 'text', description: 'Nombre completo del caso', nivel: 'critico', seccion: 'proceso' },
    juzgado: { type: 'text', description: 'Número de juzgado', nivel: 'critico', seccion: 'proceso' },
    ciudad: { type: 'text', description: 'Ciudad del tribunal', nivel: 'critico', seccion: 'proceso' },
    parte_recurrente: { type: 'text', description: 'Parte que interpone el recurso', nivel: 'critico', seccion: 'partes' },
    parte_demandado: { type: 'text', description: 'Parte contraria', nivel: 'recomendado', seccion: 'partes' },
    actor: { type: 'text', description: 'Actor/Demandante', nivel: 'critico', seccion: 'partes' },
    demandado: { type: 'text', description: 'Demandado', nivel: 'critico', seccion: 'partes' },
    abogado_recurrente: { type: 'text', description: 'Abogado del recurrente', nivel: 'critico', seccion: 'abogados' },
    abogado_actor: { type: 'text', description: 'Abogado del actor', nivel: 'recomendado', seccion: 'abogados' },
    abogado_demandado: { type: 'text', description: 'Abogado del demandado', nivel: 'recomendado', seccion: 'abogados' },
    matricula_recurrente: { type: 'text', description: 'Matrícula del abogado', nivel: 'critico', seccion: 'abogados' },
    matricula_actor: { type: 'text', description: 'Matrícula del abogado actor', nivel: 'recomendado', seccion: 'abogados' },
    matricula_demandado: { type: 'text', description: 'Matrícula del abogado demandado', nivel: 'recomendado', seccion: 'abogados' },
    domicilio_actor: { type: 'text', description: 'Domicilio del actor', nivel: 'critico', seccion: 'domicilios' },
    domicilio_demandado: { type: 'text', description: 'Domicilio del demandado', nivel: 'recomendado', seccion: 'domicilios' },
    domicilio_electronico: { type: 'text', description: 'Domicilio electrónico', nivel: 'opcional', seccion: 'domicilios' },
    resolucion_apelada: { type: 'text', description: 'Resolución que se apelda', nivel: 'critico', seccion: 'resolucion' },
    fecha_resolucion: { type: 'date', description: 'Fecha de la resolución', nivel: 'critico', seccion: 'fechas' },
    fecha_presentacion: { type: 'date', description: 'Fecha de presentación', nivel: 'recomendado', seccion: 'fechas' },
    fecha_sentencia: { type: 'date', description: 'Fecha de sentencia', nivel: 'recomendado', seccion: 'fechas' },
    agravios: { type: 'textarea', description: 'Agravios del recurso', nivel: 'recomendado', seccion: 'agravios' },
    fundamentos: { type: 'textarea', description: 'Fundamentos jurídicos', nivel: 'recomendado', seccion: 'agravios' },
    norma_invocada: { type: 'text', description: 'Norma legal citada', nivel: 'recomendado', seccion: 'normas' },
    objeto_procesal: { type: 'textarea', description: 'Objeto del proceso', nivel: 'critico', seccion: 'proceso' },
    monto: { type: 'currency', description: 'Monto en disputa', nivel: 'critico', seccion: 'proceso' },
    hechos: { type: 'textarea', description: 'Hechos de la causa', nivel: 'recomendado', seccion: 'agravios' },
    resultado: { type: 'text', description: 'Resultado de la resolución', nivel: 'critico', seccion: 'resolucion' },
    parte_peticionaria: { type: 'text', description: 'Parte que petitiona', nivel: 'critico', seccion: 'partes' },
    medida_solicitada: { type: 'text', description: 'Medida cautelar solicitada', nivel: 'critico', seccion: 'otros' },
    periculum: { type: 'textarea', description: 'Peligro en la demora', nivel: 'recomendado', seccion: 'agravios' },
    fumus: { type: 'textarea', description: 'Fumus boni iuris', nivel: 'recomendado', seccion: 'agravios' },
    prueba_ofrecida: { type: 'textarea', description: 'Prueba ofrecida', nivel: 'opcional', seccion: 'otros' },
    testigos: { type: 'textarea', description: 'Testigos propuestos', nivel: 'opcional', seccion: 'testigos' },
    fojas: { type: 'number', description: 'Número de fojas', nivel: 'opcional', seccion: 'otros' },
    juez: { type: 'text', description: 'Nombre del juez', nivel: 'opcional', seccion: 'otros' },
    tipo_accion: { type: 'text', description: 'Tipo de acción judicial', nivel: 'recomendado', seccion: 'proceso' }
  };
}

function generarPromptExtraccion(categoria, contexto = {}) {
  const baseInstruction = `REGLAS CRÍTICAS:
1. SOLO extrae datos que estén CLARAMENTE presentes en el texto del documento
2. Si un dato NO está explícito en el texto, devuelve null (NO inferigas ni inventes)
3. Sé conservador: es mejor dejar vacío que inventar información
4. No asumas roles procesales sin evidencia textual clara
5. Devuelve SOLO JSON válido`;

  const promptsPorCategoria = {
    recurso: `${baseInstruction}

Analiza este documento de RECURSO DE APELACIÓN y extrae datos específicos.

DATOS A BUSCAR (solo si están en el texto):
- parte_recurrente: Quién interpone el recurso (nombre completo)
- resolucion_apelada: Número de resolución que se apela
- fecha_resolucion: Fecha de la resolución apelada
- agravios: Fundamentos del recurso (texto literal si está)
- fundamentos: Fundamentos jurídicos
- norma_invocada: Artículos/leyes citadas
- parte_demandado: Parte contraria
- abogado_recurrente y matricula_recurrente

DATOS DEL PROCESO:
- expediente, caratula, juzgado, ciudad, fuero`,

    demanda: `${baseInstruction}

Analiza esta DEMANDA y extrae datos específicos.

DATOS A BUSCAR (solo si están en el texto):
- actor: Nombre del demandante
- demandado: Nombre del demandado
- domicilio_actor: Domicilio del actor
- objeto_procesal: Qué se pide
- monto: Monto demandado
- hechos: Hechos de la causa
- fecha_contrato: Fecha del hecho origen
- dni_actor / CUIT_actor: Documento
- abogado_actor y matricula_actor

DATOS DEL PROCESO:
- expediente, caratula, juzgado, ciudad, fuero`,

    petitorio: `${baseInstruction}

Analiza este PETITORIO/MEDIDA CAUTELAR y extrae datos.

DATOS A BUSCAR (solo si están en el texto):
- parte_peticionaria: Quién pide la medida
- medida_solicitada: Qué medida se pide
- objeto_procesal: Objeto del proceso
- periculum: Peligro en la demora
- fumus: Fumus boni iuris
- fundamentos
- expediente y caratula`,

    contestacion: `${baseInstruction}

Analiza esta CONTESTACIÓN DE DEMANDA y extrae datos.

DATOS A BUSCAR (solo si están en el texto):
- demandado: Quién contesta
- actor: Actor original
- contesta_factum: Cómo niega/reconoce hechos
- contesta_derecho: Defensas
- defensas y excepciones
- expediente y caratula`,

    resolucion: `${baseInstruction}

Analiza esta RESOLUCIÓN y extrae datos.

DATOS A BUSCAR (solo si están en el texto):
- resultado: Decisión (hacer lugar, rechazar, etc.)
- antecedentes
- fundamentos
- expediente, caratula
- fecha`
  };

  return promptsPorCategoria[categoria] || promptsPorCategoria.otro;
}

module.exports = {
  extractVariables,
  fillTemplate,
  calculateCompletitud,
  findBestTemplate,
  incrementUsage,
  getTemplatesGroupedByCategory,
  getVariablesCatalog,
  CATEGORIAS_TIPO,
  NIVEL_VARIABLE,
  getNivelVariable,
  VARIABLES_POR_CATEGORIA,
  generarPromptExtraccion
};
