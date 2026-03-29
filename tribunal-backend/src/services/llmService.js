const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `Eres un asistente legal especializado en derecho procesal argentino. Analiza el siguiente documento y extrae los datos en formato JSON.

Devuelve SOLO JSON válido con esta estructura exacta, sin texto adicional:
{
  "tipoEscritura": "decreto|resolucion|petitorio|oficio|nota|demanda|contestacion|recurso|otro",
  "fuero": "penal|civil|laboral|familia|comercial|administrativo",
  "expediente": "Número de expediente completo o null",
  "caratula": "Nombre del caso completo o null",
  "juzgado": "Número de juzgado o null",
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

  async analyzeDocument(text) {
    const cleanedText = this.cleanTextForAnalysis(text);
    
    if (this.isConfigured) {
      return this.analyzeWithGroq(cleanedText);
    } else if (this.useOllama) {
      return this.analyzeWithOllama(cleanedText);
    } else {
      return this.analyzeWithOllamaFallback(cleanedText);
    }
  }

  cleanTextForAnalysis(text) {
    return text
      .substring(0, 12000)
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async analyzeWithGroq(text) {
    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `Analiza este documento legal argentino y extrae los datos:\n\n${text}`
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 2048
      });

      const response = completion.choices[0]?.message?.content;
      return this.parseLLMResponse(response);
    } catch (error) {
      console.error('Error con Groq API:', error);
      throw new Error('Error al analizar documento con IA');
    }
  }

  async analyzeWithOllama(text) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `${SYSTEM_PROMPT}\n\nAnaliza este documento legal:\n\n${text}`,
          stream: false,
          options: {
            temperature: 0.1,
            num_predict: 2048
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
      return this.analyzeWithOllamaFallback(text);
    }
  }

  async analyzeWithOllamaFallback(text) {
    this.useOllama = true;
    return this.analyzeWithOllama(text);
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

  async generateFromTemplate(template, data) {
    const prompt = `Eres un asistente legal argentino. Completa el siguiente modelo de escrito judicial con los datos proporcionados.

DATOS EXTRAÍDOS:
${JSON.stringify(data, null, 2)}

MODELO DE ESCRITO:
${template.contenido}

INSTRUCCIONES:
1. Reemplaza las variables entre {{ }} con los datos proporcionados
2. Mantén el formato legal y la estructura del modelo
3. Si falta algún dato, indica [DATOS PENDIENTES]
4. No inventes información que no esté en los datos

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
