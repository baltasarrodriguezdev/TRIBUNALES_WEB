const extractionService = require('./src/services/extractionService');

const CASOS_PRUEBA = {
  caso1: {
    nombre: 'Documento completo y claro - Recurso de Apelación',
    texto: `JUZGADO DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° 5 - CÓRDOBA
Expediente N° 12345/2024
Carátula: GONZALEZ CARLOS c/ PEREZ MARIA s/ INCIDENTE DE EXECUCION

Recurso de Apelación contra resolución de fecha 15 de marzo de 2024

Sr. Juez:
DR. JUAN MARTINEZ, Abogado, Matrícula N° 45.678, CUIT 20-12345678-9, domicilio electrónico juan.martinez@mail.com, en mi carácter de apelante en los autos "GONZALEZ CARLOS c/ PEREZ MARIA s/ INCUMPLIMIENTO DE CONTRATO", ante Ud. respetuosamente me presento y digo:

PRIMERO: Que vengo por este medio a interponer RECURSO DE APELACIÓN contra la resolución de fs. 150, de fecha 15 de marzo de 2024, por la cual se rechaza la excepción de prescripción opuesta por esta parte.

SEGUNDO: Los agravios de esta parte son los siguientes: a) Error en la calificación jurídica de los hechos; b) Incorrecta valoración de la prueba; c) Violación del principio de buena fe procesal.

TERCERO: Fundamento el recurso en los artículos 242, 243, 244 y 245 del Código Procesal Civil y Comercial de la Provincia de Córdoba, como así también en los artículos 1034, 1037 y concordantes del Código Civil y Comercial de la Nación.

CUARTO: Solicito al Tribunal que se conceda el recurso y se revoque la resolución apelada.

PROVEER DE CONFORMIDAD
SERÁ JUSTICIA`
  },

  caso2: {
    nombre: 'Documento incompleto - Solo datos básicos',
    texto: `Exp: 99999/2023
Demandante: López Ana
Demandado: García Roberto

Este es un documento de prueba con datos incompletos.`
  },

  caso3: {
    nombre: 'Documento ambiguo - Roles no claros',
    texto: `En los autos seguido entre:
- Martinez José
- Fernandez Isabel

Por incumplimiento de contrato de alquiler.

El abogado Dr. Pedro Sánchez presenta escrito en representación de quien corresponda.`
  },

  caso4: {
    nombre: 'Documento desordenado con ruido',
    texto: `*** DOCUMENTO ESCANEADO *** 
Algunas partes pueden no ser legibles

NOTA: Este es un documento de prueba con ruido
abc123xyz

JUZGADO 3 - LA PLATA
EXPEDIENTE 55555/2022
CARATULA: SIMPSON HOMERO c/ NMARTINEZ LISA

En la ciudad de La Plata, a 20 de Mayo de 2022, comparece:
SR. SIMPSON HOMERO, D.N.I. 12.345.678, con domicilio en Avenida 13 N° 1234, La Plata
Contra: SR. MARTINEZ LISA, con domicilio en Calle 50 N° 567, La Plata

ABOGADO: DRA. MARIA GONZALEZ, Matrícula 98.765

OBJETO: Se demanda el cobro de pesos por la suma de $150.000.-

TESTIGOS PROPUSTOS:
- SR. BART SIMPSON, DNI 55.555.555,domicilio Av. Siempreviva 742
- SR. NED FLANDERS, DNI 66.666.666`
  },

  caso5: {
    nombre: 'Demanda con todos los datos',
    texto: `JUZGADO DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° 8 - ROSARIO
Expediente N° 78456/2024
Carátula: DISTRIBUIDORA DEL LITORAL S.A. c/ COMERCIAL NORTE S.R.L. s/ ORDINARIO

SEÑOR JUEZ:

DRA. CARLA RODRIGUEZ, Abogada, Matrícula Provincial N° 78.901, CUIT 30-71234567-8, constituyendo domicilio electrónico en carla.rodriguez@estudiojuridico.com.ar, en nombre y representación de DISTRIBUIDORA DEL LITORAL S.A., CUIT 30-71234567-8, con domicilio en Avenida Pellegrini 2500, Rosario, Provincia de Santa Fe, ante Ud. me presento y respetuosamente DIGO:

PRIMERO: OBJECIÓN PROCESAL
Que vengo por el presente a interponer DEMANDA ORDINARIA por COBRO DE PESOS contra COMERCIAL NORTE S.R.L., CUIT 30-80123456-7, con domicilio en calle San Martín 1500, Rosario, Provincia de Santa Fe.

SEGUNDO: HECHOS
Con fecha 15 de enero de 2024, mi representada Celebró un contrato de suministro comercial con la demandada, por un monto total de PESOS QUINIENTOS MIL ($500.000.-). La demandada no ha cumplido con el pago despite los reclamos efectuados.

TERCERO: FUNDAMENTOS DE DERECHO
Fundamento la presente en los artículos 1017, 1034, 1037 y siguientes del Código Civil y Comercial de la Nación.

CUARTO: PRUEBA
Se ofrece prueba documental, pericial contable y testimonial.

QUINTO: PETICIÓN
Por todo lo expuesto, solicito al Tribunal:
a) Se admita la presente demanda
b) Se condene a la demandada al pago de PESOS QUINIENTOS MIL ($500.000.-)
c) Se condene en costas

PROVEER DE CONFORMIDAD
SERÁ JUSTICIA

ROSARIO, 10 de Marzo de 2024`
  }
};

async function ejecutarPruebas() {
  console.log('='.repeat(80));
  console.log('PRUEBAS DEL SISTEMA DE EXTRACCIÓN HÍBRIDA');
  console.log('='.repeat(80));

  for (const [key, caso] of Object.entries(CASOS_PRUEBA)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`CASO ${key.toUpperCase()}: ${caso.nombre}`);
    console.log('='.repeat(80));

    try {
      const resultado = await extractionService.hybridExtract(caso.texto, 'recurso', { useAI: false });

      if (resultado.success) {
        console.log('\n--- DATOS EXTRAÍDOS ---');
        console.log(JSON.stringify(resultado.data, null, 2));

        console.log('\n--- METADATOS (CONFIANZA) ---');
        if (resultado.metadata) {
          console.log('Resumen:', resultado.metadata.summary);
          console.log('\nDetalle por campo:');
          for (const [campo, meta] of Object.entries(resultado.metadata.confidenceMap || {})) {
            console.log(`  ${campo}: ${meta.confidence} (${meta.source})`);
          }
        }
      } else {
        console.log('Error:', resultado.error);
      }
    } catch (error) {
      console.error('Error ejecutando prueba:', error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('PRUEBAS DE PATRONES INDIVIDUALES');
  console.log('='.repeat(80));

  const textoPrueba = 'El expediente N° 12345/2023 fue presentado el 15 de marzo de 2024 en el Juzgado de Primera Instancia en lo Civil y Comercial N° 5 de Córdoba. El Dr. Juan Pérez, matrícula 45.678, actúa como abogado del actor.';
  
  console.log('\nTexto de prueba:', textoPrueba);
  console.log('\n--- Extracción por patrones ---');
  
  const patterns = ['expediente', 'juzgado', 'ciudad', 'matricula'];
  for (const pattern of patterns) {
    const result = extractionService.extractByPattern(textoPrueba, pattern);
    console.log(`${pattern}:`, result);
  }

  console.log('\n--- Extracción de partes ---');
  const parties = extractionService.extractParties(textoPrueba);
  console.log('Partes:', JSON.stringify(parties, null, 2));

  console.log('\n--- Normalización ---');
  console.log('normalizeName("DR. JUAN PEREZ"):', extractionService.normalizeName('DR. JUAN PEREZ'));
  console.log('normalizeCiudad("CORDOBA"):', extractionService.normalizeCiudad('CORDOBA'));
  console.log('normalizeDate("15 de marzo de 2024"):', extractionService.normalizeDate('15 de marzo de 2024'));
  console.log('normalizeMonto("$150.000"):', extractionService.normalizeMonto('$150.000'));
}

ejecutarPruebas().catch(console.error);
