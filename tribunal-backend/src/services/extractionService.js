const llmService = require('./llmService');

const CONFIDENCE = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
};

const CIUDADES_ARGENTINAS = [
  'buenos aires', 'caba', 'capital federal', 'la plata', 'rosario', 'córdoba', 
  'mendoza', 'san miguel de tucumán', 'salta', 'santa fe', 'resistencia',
  'corrientes', 'posadas', 'formosa', 'neuquén', 'rawson', 'viedma', 'bariloche',
  'tierra del fuego', 'ushuaia', 'rio gallegos', 'san juan', 'san luis', 'catamarca',
  'la rioja', 'santiago del estero', 'jujuy', 'entre rios', 'concepción del uruguai',
  'parana', 'tucumán', 'chaco', 'misiones', 'chubut', 'santa cruz', 'jujuy'
];

const FUEROS = [
  'civil', 'comercial', 'penal', 'laboral', 'familia', 'administrativo', 
  'contencioso administrativo', 'civil y comercial', 'criminal', 'correccional',
  'garantías', 'ejecución', 'conciliación', 'menores'
];

const PATRONES = {
  expediente: [
    /(?:expediente|exp|ex)\s*(?:n[°º]?)?\s*[:\-]?\s*(\d{1,6}[/\-]\d{2,4})/gi,
    /expediente\s*n[°º]?\s*(\d+[\/\-]\d{4})/gi,
    /(?:n[°º]?|numero)\s*(\d{5,7}\/\d{4})/gi
  ],
  
  Juzgado: [
    /juzgado\s*(?:de\s*)?(?:primera\s*)?(?:instancia\s*)?(?:en\s*lo\s*)?(\w+)\s*(?:n[°º]?\s*)?(\d+)/gi,
    /juzgado\s*n[°º]?\s*(\d+)/gi,
    /j\.\s*n[°º]?\s*(\d+)/gi,
    /(?:juzgado|jc|js)\s*n[°º]?\s*(\d+)/gi
  ],
  
  ciudad: [
    new RegExp(`\\b(${CIUDADES_ARGENTINAS.join('|')})\\b`, 'gi'),
    /(?:ciudad|localidad)\s*[:\-]?\s*([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)*)/gi
  ],
  
  fuero: [
    new RegExp(`(fuero\\s+(?:de\\s+)?(?:lo\\s+)?(?:${FUEROS.join('|')}))`, 'gi'),
    /(?:en\\s+lo\\s+(civil|comercial|penal|laboral|familiar|administrativo))/gi
  ],
  
  matricula: [
    /(?:matr[iu]cula|m\.?)\s*(?:n[°º]?)?\s*[:\-]?\s*(\d{3,6})/gi,
    /(?:matr[iu]cula)\s*(?:profesional)?\s*(?:n[°º]?\s*)?(\d+)/gi,
    /n[°º]?\s*(\d{5,6})\s*(?:-|,)\s*(?:matr[iu]cula)/gi
  ],
  
  dni: [
    /D\.?N\.?I\.?\s*n[°º]?\s*[:\-]?\s*(\d{1,3}\.?\d{3}\.?\d{3})/gi,
    /DNI\s*n[°º]?\s*[:\-]?\s*(\d{7,8})/gi,
    /\b(\d{2}\.\d{3}\.\d{3})\b/g
  ],
  
  CUIT: [
    /C\.?U\.?I\.?T\.?\s*n[°º]?\s*[:\-]?\s*(\d{2}-\d{8}-\d)/gi,
    /\b(\d{2}-\d{8}-\d)\b/g
  ],
  
  fecha: [
    /(\d{1,2})\s*de\s*(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z]*\s*de\s*(\d{4})/gi,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g
  ],
  
  telefono: [
    /(?:tel|tel[eé]fono|cel|m[óo]vil)\s*[:\-]?\s*(\+?54?\s?9?\s?\d{2,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/gi,
    /\b(\d{3,4}\s\d{3,4})\b/g
  ],
  
  email: [
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  ],
  
  resolucion: [
    /(?:resoluci[óo]n|resol|res)\s*n[°º]?\s*[:\-]?\s*(\d+[\/\-]\d{4}|\d+)/gi,
    /(?:sentencia|fallo|auto)\s*n[°º]?\s*[:\-]?\s*(\d+[\/\-]\d{4}|\d+)/gi
  ],
  
  monto: [
    /\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
    /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:pesos|ARS|pesos)/gi,
    /(?:monto|cuant[iá]a|valor)\s*[:\-]?\s*\$\s*(\d+)/gi
  ],
  
  fojas: [
    /(?:fojas?|ff?\.?)\s*n[°º]?\s*[:\-]?\s*(\d+)/gi,
    /\bfojas?\s*(\d+)\b/gi
  ]
};

const ROLES_PROCESALES = {
  actor: ['actor', 'demandante', 'parte actora', 'accionante', 'parte actora', 'promovente'],
  demandado: ['demandado', 'demandada', 'parte demandada', 'reo', 'demandado', 'parte contraria'],
  recurrente: ['recurrente', 'apelante', 'impugnante', 'parte que recurre'],
  recurrido: ['recurrido', 'apelado', 'parte recurrida'],
  querellante: ['querellante'],
  imputado: ['imputado', 'encausado', 'procesado'],
  victima: ['víctima', 'damnificado'],
  testigo: ['testigo', 'declarante'],
  perito: ['perito', 'experto'],
  functor: ['fiscal', 'fiscalía', 'fiscal de cámara'],
  defensor: ['defensor', 'defensoría'],
  querellante: ['querellante']
};

const PREFIJOS_ABOGADO = ['dr.', 'dr', 'dra.', 'dra', 'ab.', 'abogado', 'letrado'];

function detectRole(text, name) {
  if (!name || !text) return null;
  
  const lowerText = text.toLowerCase();
  const lowerName = name.toLowerCase();
  
  const namePosition = lowerText.indexOf(lowerName);
  if (namePosition === -1) return null;
  
  const contextStart = Math.max(0, namePosition - 150);
  const contextEnd = Math.min(lowerText.length, namePosition + 150);
  const context = lowerText.substring(contextStart, contextEnd);
  
  for (const [role, keywords] of Object.entries(ROLES_PROCESALES)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`(?:${keyword})\\s+${escapeRegex(lowerName)}|${escapeRegex(name)}\\s+(?:${keyword})`, 'i');
      if (regex.test(context) || regex.test(lowerText)) {
        return role;
      }
    }
  }
  
  return null;
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, ' ')
    .trim();
}

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  
  const meses = {
    'ene': '01', 'enero': '01', 'feb': '02', 'febrero': '02', 'mar': '03', 'marzo': '03',
    'abr': '04', 'abril': '04', 'may': '05', 'mayo': '05', 'jun': '06', 'junio': '06',
    'jul': '07', 'julio': '07', 'ago': '08', 'agosto': '08', 'sep': '09', 'septiembre': '09',
    'oct': '10', 'octubre': '10', 'nov': '11', 'noviembre': '11', 'dic': '12', 'diciembre': '12'
  };
  
  let normalized = dateStr.toLowerCase().trim();
  
  const match1 = normalized.match(/(\d{1,2})\s*de\s*(\w+)\s*de\s*(\d{4})/);
  if (match1) {
    const dia = match1[1].padStart(2, '0');
    const mes = meses[match1[2]] || '01';
    const anio = match1[3];
    return `${anio}-${mes}-${dia}`;
  }
  
  const match2 = normalized.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (match2) {
    const dia = match2[1].padStart(2, '0');
    const mes = match2[2].padStart(2, '0');
    const anio = match2[3];
    return `${anio}-${mes}-${dia}`;
  }
  
  return dateStr;
}

function normalizeName(name) {
  if (!name) return '';
  
  let normalized = name.trim();
  
  normalized = normalized.replace(/\s+/g, ' ');
  
  normalized = normalized.split(' ')
    .map(word => {
      if (PREFIJOS_ABOGADO.includes(word.toLowerCase())) {
        return word.toLowerCase() + ' ';
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  normalized = normalized.replace(/\s+,\s*/g, ', ');
  normalized = normalized.replace(/,\s+/g, ', ');
  
  return normalized.trim();
}

function normalizeCiudad(ciudad) {
  if (!ciudad) return '';
  
  let normalized = normalizeName(ciudad);
  
  const mapeoCapital = {
    'caba': 'CABA',
    'capital federal': 'Capital Federal',
    'buenos aires': 'Buenos Aires',
    'la plata': 'La Plata',
    'santa fe': 'Santa Fe',
    'santiago del estero': 'Santiago del Estero',
    'tierra del fuego': 'Tierra del Fuego',
    'entre Rios': 'Entre Ríos'
  };
  
  const lower = normalized.toLowerCase();
  for (const [key, value] of Object.entries(mapeoCapital)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  
  return normalized;
}

function normalizeFuero(fuero) {
  if (!fuero) return '';
  
  const lower = fuero.toLowerCase();
  
  if (lower.includes('civil') && lower.includes('comercial')) return 'civil_y_comercial';
  if (lower.includes('civil')) return 'civil';
  if (lower.includes('comercial')) return 'comercial';
  if (lower.includes('penal')) return 'penal';
  if (lower.includes('laboral')) return 'laboral';
  if (lower.includes('familia')) return 'familia';
  if (lower.includes('administrativo') || lower.includes('contencioso')) return 'administrativo';
  
  return fuero;
}

function normalizeMonto(monto) {
  if (!monto) return '';
  
  const cleaned = monto.replace(/[$\s]/g, '').replace(/\./g, '');
  
  const match = cleaned.match(/^(\d+)/);
  if (match) {
    const numero = parseInt(match[1], 10);
    return numero.toLocaleString('es-AR');
  }
  
  return monto;
}

function extractByPattern(text, fieldName) {
  const patterns = PATRONES[fieldName];
  if (!patterns || !text) return null;
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = [...text.matchAll(regex)];
    
    if (matches.length > 0) {
      const match = matches[0];
      if (match[1]) {
        return {
          value: match[1].trim(),
          confidence: CONFIDENCE.ALTA,
          source: 'pattern',
          pattern: fieldName
        };
      }
    }
  }
  
  return null;
}

function extractAllPatterns(text) {
  const results = {};
  
  for (const fieldName of Object.keys(PATRONES)) {
    const result = extractByPattern(text, fieldName);
    if (result) {
      results[fieldName] = result;
    }
  }
  
  return results;
}

function extractParties(text) {
  const results = {
    actor: null,
    demandado: null,
    recurrente: null,
    recurrido: null
  };
  
  const patterns = [
    /((?:Sr\.?|Sra\.?|Dr\.?|Dra\.?)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/g,
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\s*,\?\s*(?:contra|vs\.?|versus|demandado|demandada|recurrente|apelante)/gi,
    /(?:contra|vs\.?|versus)\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})/gi
  ];
  
  const found = [];
  
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 5) {
        found.push(name);
      }
    }
  }
  
  const uniqueNames = [...new Set(found)];
  
  for (const name of uniqueNames.slice(0, 4)) {
    const role = detectRole(text, name);
    
    if (role === 'actor' && !results.actor) {
      results.actor = { value: normalizeName(name), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
    } else if (role === 'demandado' && !results.demandado) {
      results.demandado = { value: normalizeName(name), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
    } else if (role === 'recurrente' && !results.recurrente) {
      results.recurrente = { value: normalizeName(name), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
    } else if (role === 'recurrido' && !results.recurrido) {
      results.recurrido = { value: normalizeName(name), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
    } else if (!results.actor && !results.demandado && !results.recurrente) {
      if (!results.actor) {
        results.actor = { value: normalizeName(name), confidence: CONFIDENCE.BAJA, source: 'inferred' };
      } else if (!results.demandado) {
        results.demandado = { value: normalizeName(name), confidence: CONFIDENCE.BAJA, source: 'inferred' };
      }
    }
  }
  
  return results;
}

function extractLawyers(text) {
  const results = {
    abogado_actor: null,
    abogado_demandado: null,
    abogado_recurrente: null
  };
  
  const lawyerPatterns = [
    /(?:Dr\.?|Dra\.?|Ab\.?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,2})/g,
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,2})\s*,\s*(?:abogado|letrado)/gi,
    /(?:abogado|letrado)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,2})/gi
  ];
  
  const found = [];
  
  for (const pattern of lawyerPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const name = match[1]?.trim();
      if (name && name.length > 5 && !CIUDADES_ARGENTINAS.some(c => name.toLowerCase().includes(c))) {
        found.push(name);
      }
    }
  }
  
  const uniqueLawyers = [...new Set(found)];
  
  for (const lawyer of uniqueLawyers.slice(0, 3)) {
    const role = detectRole(text, lawyer);
    
    if (role === 'actor' || role === 'recurrente') {
      if (!results.abogado_recurrente) {
        results.abogado_recurrente = { value: normalizeName(lawyer), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
      }
    } else if (role === 'demandado') {
      if (!results.abogado_demandado) {
        results.abogado_demandado = { value: normalizeName(lawyer), confidence: CONFIDENCE.MEDIA, source: 'role_detection' };
      }
    } else if (!results.abogado_actor) {
      results.abogado_actor = { value: normalizeName(lawyer), confidence: CONFIDENCE.BAJA, source: 'inferred' };
    }
  }
  
  return results;
}

function extractDomicilios(text) {
  const results = {
    domicilio_actor: null,
    domicilio_demandado: null,
    domicilio_electronico: null
  };
  
  const domPatterns = [
    /(?:domicilio|dirección)\s*(?:real|legal|procesal)?\s*[:\-]?\s*([^,\n]{10,80})/gi,
    /(?:sitio\s*)?(?:web|electrónico|email|correo)\s*[:\-]?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ];
  
  const found = [];
  const emails = [];
  
  for (const pattern of domPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      if (match[1]) {
        const value = match[1].trim();
        if (value.includes('@')) {
          emails.push({ value, confidence: CONFIDENCE.ALTA, source: 'pattern' });
        } else if (value.length > 10) {
          found.push({ value, confidence: CONFIDENCE.MEDIA, source: 'pattern' });
        }
      }
    }
  }
  
  if (emails.length > 0) {
    results.domicilio_electronico = emails[0];
  }
  
  for (const dom of found.slice(0, 2)) {
    if (!results.domicilio_actor) {
      results.domicilio_actor = dom;
    } else if (!results.domicilio_demandado) {
      results.domicilio_demandado = dom;
    }
  }
  
  return results;
}

function mergeResults(patternResults, aiResults) {
  const merged = {};
  
  if (patternResults) {
    for (const [key, patternData] of Object.entries(patternResults)) {
      if (patternData && patternData.value) {
        merged[key] = {
          value: patternData.value,
          confidence: patternData.confidence,
          source: 'pattern'
        };
      }
    }
  }
  
  if (aiResults) {
    for (const [key, aiData] of Object.entries(aiResults)) {
      if (aiData && !merged[key]) {
        merged[key] = {
          value: aiData,
          confidence: CONFIDENCE.MEDIA,
          source: 'ai'
        };
      }
    }
  }
  
  return merged;
}

function selectBestValue(values) {
  if (!values || Object.keys(values).length === 0) return null;
  
  let best = null;
  let bestConfidence = -1;
  
  for (const [key, data] of Object.entries(values)) {
    const confidenceOrder = { alta: 3, media: 2, baja: 1 };
    const confidenceScore = confidenceOrder[data.confidence] || 0;
    
    if (confidenceScore > bestConfidence) {
      bestConfidence = confidenceScore;
      best = { key, ...data };
    }
  }
  
  return best;
}

async function hybridExtract(text, category = 'otro', opciones = {}) {
  if (!text || text.length < 50) {
    return {
      success: false,
      error: 'Texto insuficiente para extraer datos'
    };
  }
  
  const normalizedText = normalizeText(text);
  
  const patternResults = {
    ...extractAllPatterns(normalizedText),
    ...extractParties(normalizedText),
    ...extractLawyers(normalizedText),
    ...extractDomicilios(normalizedText)
  };
  
  const ciudadMatch = extractByPattern(normalizedText, 'ciudad');
  if (ciudadMatch) {
    patternResults.ciudad = {
      ...ciudadMatch,
      value: normalizeCiudad(ciudadMatch.value),
      confidence: CONFIDENCE.ALTA
    };
  }
  
  const fueroMatch = extractByPattern(normalizedText, 'fuero');
  if (fueroMatch) {
    patternResults.fuero = {
      ...fueroMatch,
      value: normalizeFuero(fueroMatch.value),
      confidence: CONFIDENCE.MEDIA
    };
  }
  
  const montoMatch = extractByPattern(normalizedText, 'monto');
  if (montoMatch) {
    patternResults.monto = {
      ...montoMatch,
      value: normalizeMonto(montoMatch.value),
      confidence: CONFIDENCE.ALTA
    };
  }
  
  if (patternResults.actor && patternResults.actor.confidence === CONFIDENCE.BAJA) {
    patternResults.actor = { ...patternResults.actor, confidence: CONFIDENCE.MEDIA };
  }
  
  let aiResults = null;
  const useAI = opciones.useAI !== false;
  
  if (useAI) {
    try {
      const prompt = generateExtractionPrompt(category, patternResults);
      const aiResponse = await llmService.analyzeDocument(normalizedText, prompt);
      
      if (aiResponse.success) {
        aiResults = aiResponse.data;
      }
    } catch (error) {
      console.warn('Extracción IA falló, usando solo reglas:', error.message);
    }
  }
  
  const merged = mergeResults(patternResults, aiResults);
  
  const flatResult = {};
  const confidenceMap = {};
  
  for (const [key, data] of Object.entries(merged)) {
    if (data && data.value) {
      flatResult[key] = data.value;
      confidenceMap[key] = {
        confidence: data.confidence || CONFIDENCE.BAJA,
        source: data.source || 'unknown'
      };
    }
  }
  
  const summary = calculateSummary(confidenceMap);
  
  return {
    success: true,
    data: flatResult,
    metadata: {
      confidenceMap,
      summary,
      sources: {
        pattern: Object.keys(patternResults).length,
        ai: aiResults ? Object.keys(aiResults).length : 0
      }
    }
  };
}

function generateExtractionPrompt(category, patternResults) {
  const baseInstruction = `Eres un asistente legal argentino especializado en extraer datos de documentos judiciales.

IMPORTANTE: 
- Solo extrae datos que estén CLARAMENTE presentes en el texto
- Si un dato NO está, devuelve null (no inventes)
- Sé conservador: es mejor dejar vacío que inventar
- Usa {"campo": "valor"} para cada campo`;

  const categoryInstructions = {
    recurso: `
Para RECURSO DE APELACIÓN, buscá especialmente:
- parte_recurrente:Quién interpone el recurso (demandante o demandado)
- parte_demandado:Parte contraria
- resolucion_apelada:Número de resolución que se apela
- fecha_resolucion:Fecha de la resolución apelada
- agravios o fundamentos:Motivos del recurso
- norma_invocada:Artículos o leyes citadas
- abogado y matrícula del recurrente`,

    demanda: `
Para DEMANDA, buscá especialmente:
- actor:Demandante
- demandado:Demandado  
- domicilio_actor:Domicilio del actor
- objeto_procesal:Qué se pide
- monto:Monto demandado
- hechos:Hechos de la causa
- fecha_contrato:Fecha del hecho que origina la obligación
- abogado y matrícula del actor`,

    contestacion: `
Para CONTESTACIÓN DE DEMANDA, buscá especialmente:
- demandado:Quién contesta
- actor:Contra quién se contesta
- contesta_factum:Cómo reconoce o niega los hechos
- contesta_derecho:Defensas jurídicas
- excepciones:Excepciones Opuestas
- abogado y matrícula`,

    petitorio: `
Para PETITORIO/MEDIDA CAUTELAR, buscá especialmente:
- parte_peticionaria:Quién pide la medida
- medida_solicitada:Qué medida se pide
- objeto_procesal:Objeto del proceso principal
- periculum:Peligro en la demora
- fumus:Fumus boni iuris
- fundamentos`,

    resolucion: `
Para RESOLUCIÓN/SENTENCIA, buscá especialmente:
- resultado:Qué se decide (condena, absuelve, admite, rechaza)
- fundamentos:Razones de la decisión
- expediente y caratula
- fecha`,

    otro: `
Buscá:
- expediente, caratula, juzgado, ciudad
- actor y demandado
- abogado y matrícula
- objeto procesal`
  };

  const已知Fields = Object.keys(patternResults)
    .filter(k => patternResults[k]?.confidence === 'alta')
    .map(k => `- ${k}: ${patternResults[k].value}`)
    .join('\n');

  return `${baseInstruction}
${categoryInstructions[category] || categoryInstructions.otro}

DATOS YA ENCONTRADOS CON ALTA CONFIANZA:
${已知Fields || 'Ninguno'}

Devolvé los datos en JSON:`;
}

function calculateSummary(confidenceMap) {
  const confianzaAlta = Object.values(confidenceMap || {}).filter(r => r.confidence === CONFIDENCE.ALTA).length;
  const confianzaMedia = Object.values(confidenceMap || {}).filter(r => r.confidence === CONFIDENCE.MEDIA).length;
  const confianzaBaja = Object.values(confidenceMap || {}).filter(r => r.confidence === CONFIDENCE.BAJA).length;
  const total = Object.keys(confidenceMap || {}).length;
  
  const overallConfidence = total === 0 ? 'baja' : 
                           confianzaAlta > total * 0.6 ? 'alta' : 
                           confianzaAlta + confianzaMedia > total * 0.5 ? 'media' : 'baja';
  
  return {
    totalFields: total,
    alta: confianzaAlta,
    media: confianzaMedia,
    baja: confianzaBaja,
    overallConfidence
  };
}

function convertToLegacyFormat(result) {
  if (!result.success) {
    return {
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
  
  const data = result.data;
  
  return {
    tipoEscritura: data.tipoEscritura || 'otro',
    fuero: data.fuero || null,
    expediente: data.expediente || null,
    caratula: data.caratula || null,
    juzgado: data.juzgado || null,
    partes: {
      actor: data.actor || data.parte_recurrente || data.parte_peticionaria || null,
      demandado: data.demandado || data.parte_demandado || data.recurrido || null,
      abogadoActor: data.abogado_actor || data.abogado_recurrente || null,
      abogadoDemandado: data.abogado_demandado || null
    },
    fechas: {
      presentacion: data.fecha_presentacion || data.fecha || null,
      sentencia: data.fecha_sentencia || data.fecha_resolucion || null
    },
    acciones: data.acciones || [],
    objetoProcesal: data.objeto_procesal || data.medida_solicitada || null,
    domicilios: {
      actor: data.domicilio_actor || null,
      demandado: data.domicilio_demandado || null
    },
    metadata: result.metadata
  };
}

module.exports = {
  hybridExtract,
  convertToLegacyFormat,
  extractByPattern,
  extractAllPatterns,
  extractParties,
  extractLawyers,
  extractDomicilios,
  normalizeText,
  normalizeDate,
  normalizeName,
  normalizeCiudad,
  normalizeFuero,
  normalizeMonto,
  CONFIDENCE,
  PATRONES,
  CIUDADES_ARGENTINAS,
  FUEROS
};
