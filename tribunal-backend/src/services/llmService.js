const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `Eres un asistente legal especializado en derecho procesal argentino. Analiza el siguiente documento judicial y extrae los datos en formato JSON.

REGLAS CRÍTICAS:
1. SOLO extrae datos que estén CLARAMENTE presentes en el texto
2. Si un dato NO está explícito, devuelve null (NO inventes ni inferigas)
3. Sé conservador: es mejor dejar vacío que inventar información
4. No asumas roles procesales (actor/demandado) sin evidencia textual clara

Devuelve SOLO JSON válido con esta estructura exacta, sin texto adicional:
{
  "tipoEscritura": "decreto|resolucion|petitorio|oficio|nota|demanda|contestacion|recurso|otro",
  "fuero": "penal|civil|laboral|familia|comercial|administrativo" o null,
  "expediente": "Número de expediente completo o null",
  "caratula": "Nombre del caso completo o null",
  "juzgado": "Número de juzgado o null",
  "ciudad": "Ciudad del tribunal o null",
  "partes": {
    "actor": "Nombre del actor/demandante o null",
    "demandado": "Nombre del demandado o null",
    "abogadoActor": "Nombre del abogado del actor o null",
    "abogadoDemandado": "Nombre del abogado del demandado o null"
  },
  "fechas": {
    "presentacion": "Fecha de presentación o null",
    "sentencia": "Fecha de sentencia o null"
  },
  "acciones": ["Array de acciones procesales mencionadas o array vacío"],
  "objetoProcesal": "Resumen del objeto del escrito o null",
  "domicilios": {
    "actor": "Domicilio del actor o null",
    "demandado": "Domicilio del demandado o null"
  }
}`;

class LLMService {
  constructor() {
    this.groq = null;
    this.isConfigured = false;
    this.useOllama = false;
    
    if (process.env.GROQ_API_KEY) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      this.isConfigured = true;
    }
  }

  async analyzeDocument(text, customPrompt = null) {
    const cleanedText = this.cleanTextForAnalysis(text);
    const prompt = customPrompt || SYSTEM_PROMPT;
    
    if (this.isConfigured) {
      return this.analyzeWithGroq(cleanedText, prompt);
    } else if (this.useOllama) {
      return this.analyzeWithOllama(cleanedText, prompt);
    } else {
      return this.analyzeWithOllamaFallback(cleanedText, prompt);
    }
  }

  cleanTextForAnalysis(text) {
    return text
      .substring(0, 15000)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async analyzeWithGroq(text, prompt = SYSTEM_PROMPT) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Analiza este documento legal argentino y extrae los datos en formato JSON:\n\n${text}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 3072
      });

      const response = completion.choices[0]?.message?.content;
      return this.parseLLMResponse(response);
    } catch (error) {
      console.error('Error con Groq API:', error);
      throw new Error('Error al analizar documento con IA');
    }
  }

  async analyzeWithOllama(text, prompt = SYSTEM_PROMPT) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `${prompt}\n\nAnaliza este documento legal y devuelve los datos en JSON:\n\n${text}`,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 3072
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ollama no está disponible');
      }

      const data = await response.json();
      return this.parseLLMResponse(data.response);
    } catch (error) {
      console.error('Error con Ollama:', error);
      return this.analyzeWithOllamaFallback(text, prompt);
    }
  }

  async analyzeWithOllamaFallback(text, prompt = SYSTEM_PROMPT) {
    this.useOllama = true;
    return this.analyzeWithOllama(text, prompt);
  }

  parseLLMResponse(response) {
    try {
      let jsonStr = response;
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      return {
        success: true,
        data: {
          tipoEscritura: parsed.tipoEscritura || 'otro',
          fuero: parsed.fuero || null,
          expediente: parsed.expediente || null,
          caratula: parsed.caratula || null,
          juzgado: parsed.juzgado || null,
          partes: {
            actor: parsed.partes?.actor || null,
            demandado: parsed.partes?.demandado || null,
            abogadoActor: parsed.partes?.abogadoActor || null,
            abogadoDemandado: parsed.partes?.abogadoDemandado || null
          },
          fechas: {
            presentacion: parsed.fechas?.presentacion || null,
            sentencia: parsed.fechas?.sentencia || null
          },
          acciones: parsed.acciones || [],
          objetoProcesal: parsed.objetoProcesal || null,
          domicilios: {
            actor: parsed.domicilios?.actor || null,
            demandado: parsed.domicilios?.demandado || null
          }
        }
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return {
        success: false,
        error: 'Error al parsear respuesta de IA',
        rawResponse: response.substring(0, 500)
      };
    }
  }

  async generateFromTemplate(template, data, comoBorrador = false) {
    const dataKeys = Object.keys(data).filter(k => data[k] && data[k] !== null && data[k] !== '');
    const datosDisponibles = dataKeys.length;
    const totalVars = (template.contenido.match(/\{\{\w+\}\}/g) || []).length;
    const tieneDatosSuficientes = datosDisponibles >= totalVars * 0.5;

    const instruccionesAdicionales = comoBorrador || !tieneDatosSuficientes
      ? `\n\n⚠️ IMPORTANTE: Este escrito se generará como BORRADOR porque faltan datos. 
- Deja las variables faltantes como {{variable}} sin modificar
- NO pongas "[DATOS PENDIENTES]" ni ningún indicador
- El documento se genera con los campos vacíos`
      : `\n\nINSTRUCCIÓN: Si falta un dato crítico, el escrito debe indicarlo como {{variable}} (variable sin completar).`;

    const prompt = `Eres un asistente legal argentino experto en redacción de escritos judiciales. Completa el siguiente modelo de escrito judicial SOLO con los datos proporcionados.

DATOS PROPORCIONADOS (solo estos, no inventes):
${JSON.stringify(data, null, 2)}

MODELO DE ESCRITO:
${template.contenido}

INSTRUCCIONES IMPORTANTES:
1. Reemplaza las variables {{variable}} SOLO si Tienes el dato en "DATOS PROPORCIONADOS" Y el dato no está vacío
2. Si NO tienes un dato en "DATOS PROPORCIONADOS", DEJA {{variable}} SIN MODIFICAR
3. NUNCA inventes información que no esté en los datos proporcionados
4. Mantén el formato legal profesional argentino
5. NO uses marcadores como [PENDIENTE], [DATOS PENDIENTES], [FALTA], etc.${instruccionesAdicionales}

ESCRITO COMPLETADO:`;

    if (this.isConfigured) {
      return this.generateWithGroq(prompt, template);
    } else if (this.useOllama) {
      return this.generateWithOllama(prompt);
    } else {
      return this.generateWithOllamaFallback(prompt);
    }
  }

  async generateWithGroq(prompt, template) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente legal argentino experto en redacción de escritos judiciales. Completa modelos de escritos usando los datos proporcionados, manteniendo el formato legal apropiado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 4096
      });

      return {
        success: true,
        written: completion.choices[0]?.message?.content
      };
    } catch (error) {
      console.error('Error generating with Groq:', error);
      throw new Error('Error al generar escrito');
    }
  }

  async generateWithOllama(prompt) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 4096
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ollama no está disponible');
      }

      const data = await response.json();
      return {
        success: true,
        written: data.response
      };
    } catch (error) {
      console.error('Error generating with Ollama:', error);
      return this.generateWithOllamaFallback(prompt);
    }
  }

  async generateWithOllamaFallback(prompt) {
    this.useOllama = true;
    return this.generateWithOllama(prompt);
  }
}

module.exports = new LLMService();
