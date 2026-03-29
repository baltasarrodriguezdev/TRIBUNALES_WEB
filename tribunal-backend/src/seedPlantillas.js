const mongoose = require('mongoose');

require('dotenv').config();

const Plantilla = require('./models/Plantilla');

const plantillasEjemplo = [
  {
    titulo: 'Decreto de Apertura a Prueba',
    categoria: 'decreto',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**VISTOS:**

Los presentes autos caratulados "{{caratula}}", de los que surge que a fs. {{fojas}} se presenta {{actor}}, con el patrocinio del/la letrado/a Dr./Dra. {{abogado_actor}}, y Promoting lo que ha lugar por derecho.

**CONSIDERANDO:**

Que de las piezas arrimadas surge la legitimación de las partes y la existencia de hechos disputados que hacen有必要 la apertura a prueba.

Que las medidas de prueba ofrecidas son pertinentes y conducentes para acreditar los hechos controvertidos.

**RESUELVE:**

1. TENER POR PRESENTADA la demanda y por constituído el domicilio legal.
2. ADMITIR la demanda interpuesta.
3. ORDENAR LA APERTURA A PRUEBA por el término de {{plazo_prueba}} días.
4. LISAR las siguientes pruebas:

   a) Confesional - por absueltas de posiciones de la contraria.
   
   b) Documental - la acompañada con la demanda.
   
   c) Pericial - la que se indique.
   
   d) Testimonial - la que se ofrezca.

5. PRACTICAR la prueba confesional y testimonial ante este Juzgado, con excepción de la que se ofrece por oficio.

---

**NOTIFIQUESE.**

{{ciudad}}, {{fecha}}

**FIRMA**

Dr./Dra. {{juez}}
Juez/za de Primera Instancia`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Nombre del caso' },
      { nombre: 'fojas', tipo: 'numero', requerido: true, descripcion: 'Fojas de presentación' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'abogado_actor', tipo: 'texto', requerido: true, descripcion: 'Abogado del actor' },
      { nombre: 'plazo_prueba', tipo: 'texto', requerido: false, descripcion: 'Plazo de prueba en días' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha del decreto' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' }
    ],
    ejemplo: 'Decreto modelo para apertura a prueba en juicio civil',
    activa: true
  },
  {
    titulo: 'Resolución de Sentencia',
    categoria: 'resolucion',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**VISTOS:**

Estos autos caratulados "{{caratula}}", en los que {{actor}} interpone demanda contra {{demandado}} por {{objeto_procesal}}.

**CONSIDERANDO:**

Que de la prueba producido surge acreditado que {{hechos_probados}}.

Que corresponde hacer lugar a la pretensión de {{actor}} en virtud de lo expuesto en los considerandos precedentes.

**RESUELVE:**

1. HACER LUGAR a la demanda interpuesta por {{actor}} contra {{demandado}}.
2. CONDENAR a {{demandado}} a {{condena}}.
3. IMPONER las costas del proceso a la parte demandada.
4. DIFERIR la regulación de honorarios para después de firme la presente.

**NOTIFIQUESE.**

---
{{ciudad}}, {{fecha}}

**FIRMA**

Dr./Dra. {{juez}}
Juez/za de Primera Instancia`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Nombre del caso' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'objeto_procesal', tipo: 'texto', requerido: true, descripcion: 'Objeto de la demanda' },
      { nombre: 'hechos_probados', tipo: 'texto_largo', requerido: false, descripcion: 'Hechos probados' },
      { nombre: 'condena', tipo: 'texto_largo', requerido: false, descripcion: 'Contenido de la condena' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la sentencia' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' }
    ],
    ejemplo: 'Modelo de sentencia civil',
    activa: true
  },
  {
    titulo: 'Petitorio General',
    categoria: 'petitorio',
    fuero: 'general',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**SEÑOR JUEZ:**

{{abogado_actor}}, MBA N° {{matricula_actor}}, patrono de {{actor}}, en los autos caratulados "{{caratula}}", ante V.S. respetuosamente me presento y digo:

**I. OBJETO**

Que vengo por el presente a solicitar {{peticion_principal}}.

**II. HECHOS**

Los hechos que fundan la presente petición son los siguientes: {{hechos}}.

**III. FUNDAMENTOS JURÍDICOS**

Los fundamentos de derecho son los siguientes: {{fundamentos}}.

**IV. PRUEBA**

Ofrezco la siguiente prueba: {{prueba_ofrecida}}.

**V. PETICIÓN**

Por todo lo expuesto, a V.S. respetuosamente solicito:

1. Tenga por presentada esta petición y por constituído el domicilio procesal.
2. Declare aplicable la medida solicitada.
3. Provea de conformidad.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado_actor}}
Abogado - MBA N° {{matricula_actor}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Nombre del caso' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'abogado_actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula_actor', tipo: 'texto', requerido: false, descripcion: 'Número de matrícula' },
      { nombre: 'peticion_principal', tipo: 'texto_largo', requerido: true, descripcion: 'Petición principal' },
      { nombre: 'hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Relación de hechos' },
      { nombre: 'fundamentos', tipo: 'texto_largo', requerido: true, descripcion: 'Fundamentos de derecho' },
      { nombre: 'prueba_ofrecida', tipo: 'texto_largo', requerido: false, descripcion: 'Prueba ofrecida' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha del petitorio' }
    ],
    ejemplo: 'Modelo general de petitorio judicial',
    activa: true
  },
  {
    titulo: 'Oficio a Organismo',
    categoria: 'oficio',
    fuero: 'general',
    contenido: `OFICIO N° {{numero_oficio}}

{{ciudad}}, {{fecha}}

**SEÑOR/A {{cargo_destinatario}}
{{organismo}}

Ref.: Expediente N° {{expediente}} - {{caratula}}

De mi mayor consideración:

Tengo el agrado de dirigirme a usted en relación al expediente de la referencia, a fin de solicitar {{solicitud}}.

El presente oficio se gira en cumplimiento de lo ordenado por el/a Señor/a Juez/a de Primera Instancia Dr./Dra. {{juez}} del Juzgado N° {{juzgado}}.

Sin otro particular, saluda a usted muy atentamente.`,
    variables: [
      { nombre: 'numero_oficio', tipo: 'texto', requerido: true, descripcion: 'Número de oficio' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha del oficio' },
      { nombre: 'cargo_destinatario', tipo: 'texto', requerido: true, descripcion: 'Cargo del destinatario' },
      { nombre: 'organismo', tipo: 'texto', requerido: true, descripcion: 'Nombre del organismo' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula del caso' },
      { nombre: 'solicitud', tipo: 'texto_largo', requerido: true, descripcion: 'Detalle de lo solicitado' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' },
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' }
    ],
    ejemplo: 'Modelo de oficio judicial a organismos públicos',
    activa: true
  },
  {
    titulo: 'Demanda Civil',
    categoria: 'demanda',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**SEÑOR JUEZ:**

{{abogado_actor}}, MBA N° {{matricula_actor}}, CUIT {{cuit_actor}}, con domicilio procesal en {{domicilio_actor}} y domicilio real en {{domicilio_real_actor}}, en mi carácter de letrado patrocinante de {{actor}}, CUIT {{cuit_cliente}}, con domicilio en {{domicilio_cliente}}, en los autos caratulados "{{caratula}}", ante V.S. respetuosamente me presento y digo:

**I. PARTES**

**ACTOR:** {{actor}}, {{tipo_persona_actor}}, con domicilio en {{domicilio_cliente}}.

**DEMANDADO:** {{demandado}}, {{tipo_persona_demandado}}, con domicilio en {{domicilio_demandado}}.

**II. HECHOS**

Relaciono los hechos que sustentan la presente acción:

{{hechos}}

**III. FUNDAMENTOS JURÍDICOS**

Fundamento la presente demanda en las siguientes normas:

{{fundamentos}}

**IV. OFRECIMIENTO DE PRUEBA**

Ofrezco las siguientes pruebas:

{{prueba}}

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada la demanda y por constituídos los domicilios procesales.
2. Declare la procedibilidad de la acción y admita la demanda.
3. Condene al demandado a {{peticion}}.

**PROVEER DE CONFORMIDAD SERÁ JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado_actor}}
Abogado - MBA N° {{matricula_actor}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'abogado_actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula_actor', tipo: 'texto', requerido: true, descripcion: 'Número de matrícula' },
      { nombre: 'cuit_actor', tipo: 'texto', requerido: false, descripcion: 'CUIT/CUIL del abogado' },
      { nombre: 'cuit_cliente', tipo: 'texto', requerido: false, descripcion: 'CUIT/CUIL del cliente' },
      { nombre: 'domicilio_actor', tipo: 'texto', requerido: true, descripcion: 'Domicilio procesal' },
      { nombre: 'domicilio_real_actor', tipo: 'texto', requerido: false, descripcion: 'Domicilio real' },
      { nombre: 'domicilio_cliente', tipo: 'texto', requerido: true, descripcion: 'Domicilio del cliente' },
      { nombre: 'domicilio_demandado', tipo: 'texto', requerido: true, descripcion: 'Domicilio del demandado' },
      { nombre: 'tipo_persona_actor', tipo: 'texto', requerido: false, descripcion: 'Tipo de persona (humana/jurídica)' },
      { nombre: 'tipo_persona_demandado', tipo: 'texto', requerido: false, descripcion: 'Tipo de persona demandado' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula del caso' },
      { nombre: 'hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Relación de hechos' },
      { nombre: 'fundamentos', tipo: 'texto_largo', requerido: true, descripcion: 'Fundamentos de derecho' },
      { nombre: 'prueba', tipo: 'texto_largo', requerido: true, descripcion: 'Prueba ofrecida' },
      { nombre: 'peticion', tipo: 'texto_largo', requerido: true, descripcion: 'Petición al tribunal' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la demanda' }
    ],
    ejemplo: 'Modelo completo de demanda civil',
    activa: true
  },
  {
    titulo: 'Contestación de Demanda',
    categoria: 'contestacion',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**SEÑOR JUEZ:**

{{abogado_demandado}}, MBA N° {{matricula_demandado}}, en mi carácter de letrado patrocinante de {{demandado}}, en los autos caratulados "{{caratula}}", donde {{actor}} promueve demanda contra mi poderdante, ante V.S. me presento y digo:

**I. RELACIÓN DE LOS HECHOS**

Opongo a las pretensiones de la actora las siguientes defensas y consideraciones:

{{relacion_hechos}}

**II. CONTESTACIÓN A LOS HECHOS**

En relación a los hechos narrados por la actora, debo manifestar:

{{contestacion_hechos}}

**III. DEFENSAS**

Opongo las siguientes defensas de fondo:

{{defensas}}

**IV. FUNDAMENTOS JURÍDICOS**

Los fundamentos de derecho son:

{{fundamentos}}

**V. PRUEBA**

Ofrezco la siguiente prueba:

{{prueba}}

**VI. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada esta contestación y por opuestas las defensas.
2. Rechace la demanda en todos sus términos.
3. Condene a la actora al pago de las costas del proceso.

**PROVEER DE CONFORMIDAD SERÁ JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado_demandado}}
Abogado - MBA N° {{matricula_demandado}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'abogado_demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula_demandado', tipo: 'texto', requerido: true, descripcion: 'Número de matrícula' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula del caso' },
      { nombre: 'relacion_hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Relación de hechos' },
      { nombre: 'contestacion_hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Contestación a hechos' },
      { nombre: 'defensas', tipo: 'texto_largo', requerido: true, descripcion: 'Defensas opuestas' },
      { nombre: 'fundamentos', tipo: 'texto_largo', requerido: true, descripcion: 'Fundamentos de derecho' },
      { nombre: 'prueba', tipo: 'texto_largo', requerido: true, descripcion: 'Prueba ofrecida' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la contestación' }
    ],
    ejemplo: 'Modelo de contestación a demanda civil',
    activa: true
  }
];

async function seedPlantillas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const count = await Plantilla.countDocuments();
    if (count > 0) {
      console.log(`Ya existen ${count} plantillas. No se insertarán ejemplos.`);
      await mongoose.disconnect();
      return;
    }

    await Plantilla.insertMany(plantillasEjemplo);
    console.log(`Se insertaron ${plantillasEjemplo.length} plantillas de ejemplo`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedPlantillas();
