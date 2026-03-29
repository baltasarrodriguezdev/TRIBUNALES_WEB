const mongoose = require('mongoose');

require('dotenv').config();

const Plantilla = require('./models/Plantilla');

const nuevasPlantillas = [
  {
    titulo: 'Diligencia de Intimación de Pago',
    categoria: 'escrito',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**VISTOS:**

Los presentes autos caratulados "{{caratula}}", de los que surge la existencia de obligación incumplida por parte de {{demandado}}.

**CONSIDERANDO:**

Que de las constancias de autos surge acreditada la relación obligacional y su incumplimiento.

Que corresponde ordenar la intimación de pago conforme lo establece la ley procesal.

**RESUELVE:**

1. INTIMAR a {{demandado}} para que en el plazo de {{plazo_dias}} días hábiles abone la suma de \${{monto}}, bajo apercibimiento de ejecución.

2. REALIZAR la rebotica conforme lo establecido en el artículo 553 del CPCCN.

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
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'plazo_dias', tipo: 'numero', requerido: true, descripcion: 'Plazo en días hábiles' },
      { nombre: 'monto', tipo: 'texto', requerido: true, descripcion: 'Monto a intimar' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' }
    ],
    ejemplo: 'Modelo de intimación de pago en juicio civil',
    activa: true
  },
  {
    titulo: 'Certificado de Deuda',
    categoria: 'otro',
    fuero: 'civil',
    contenido: `CERTIFICADO DE DEUDA N° {{numero_certificado}}

{{ciudad}}, {{fecha}}

---

**CERTIFICO:**

Que de los registros contables y документация obrantes en autos, surge que {{deudor}}, CUIL/CUIT N° {{cuit_deudor}}, registra la siguiente deuda:

| Concepto | Importe |
|----------|---------|
| Capital adeudado | \${{capital}} |
| Intereses compensatorios | \${{intereses}} |
| Gastos y costas | \${{gastos}} |
| **TOTAL DEUDA** | **\${{total}}** |

La presente certificación se emite a los fines de {{destino}}, en el marco del Expediente N° {{expediente}}, caratulado "{{caratula}}".

---

**OBSERVACIONES:**
{{observaciones}}

---

{{ciudad}}, {{fecha}}

**FIRMA DEL CONTADOR**

Dr. {{contador}}
Contador Público - CPA N° {{matricula_contador}}`,
    variables: [
      { nombre: 'numero_certificado', tipo: 'texto', requerido: true, descripcion: 'Número de certificado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' },
      { nombre: 'deudor', tipo: 'texto', requerido: true, descripcion: 'Nombre del deudor' },
      { nombre: 'cuit_deudor', tipo: 'texto', requerido: true, descripcion: 'CUIT/CUIL del deudor' },
      { nombre: 'capital', tipo: 'texto', requerido: true, descripcion: 'Capital adeudado' },
      { nombre: 'intereses', tipo: 'texto', requerido: false, descripcion: 'Intereses' },
      { nombre: 'gastos', tipo: 'texto', requerido: false, descripcion: 'Gastos y costas' },
      { nombre: 'total', tipo: 'texto', requerido: true, descripcion: 'Total de la deuda' },
      { nombre: 'destino', tipo: 'texto', requerido: true, descripcion: 'Destino del certificado' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula' },
      { nombre: 'observaciones', tipo: 'texto_largo', requerido: false, descripcion: 'Observaciones' },
      { nombre: 'contador', tipo: 'texto', requerido: true, descripcion: 'Nombre del contador' },
      { nombre: 'matricula_contador', tipo: 'texto', requerido: true, descripcion: 'Matrícula del contador' }
    ],
    ejemplo: 'Modelo de certificado de deuda para juicios',
    activa: true
  },
  {
    titulo: 'Recurso de Apelación',
    categoria: 'recurso',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, patrono de {{parte}}, en los autos arriba indicados, ante V.S. me presento y digo:

**I. OBJECIÓN**

Que vengo a interponer formal RECURSO DE APELACIÓN contra la resolución de fecha {{fecha_resolucion}}, que {{detalle_resolucion}}.

**II. FUNDAMENTOS**

El recurso se fundamenta en las siguientes razones:

{{fundamentos}}

**III. PROCEDENCIA**

La presente apelación es procedente conforme lo establecido en el artículo {{articulo}} del Código Procesal Civil y Comercial de la Nación.

**IV. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por interpuesto el presente recurso de apelación.
2. Concédase el recurso en relación y con efecto devolutivo.
3. Eleve los autos al Superior.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula del caso' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Número de matrícula' },
      { nombre: 'parte', tipo: 'texto', requerido: true, descripcion: 'Parte que recurre' },
      { nombre: 'fecha_resolucion', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la resolución apelada' },
      { nombre: 'detalle_resolucion', tipo: 'texto_largo', requerido: true, descripcion: 'Detalle de lo resuelto' },
      { nombre: 'fundamentos', tipo: 'texto_largo', requerido: true, descripcion: 'Fundamentos del recurso' },
      { nombre: 'articulo', tipo: 'texto', requerido: true, descripcion: 'Artículo que fundamenta el recurso' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha del recurso' }
    ],
    ejemplo: 'Modelo de recurso de apelación civil',
    activa: true
  },
  {
    titulo: 'Mandamiento de Pago',
    categoria: 'escrito',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**MANDAMIENTO DE PAGO**

---

**A LA PARTE DEMANDADA: {{demandado}}**

En nombre de la Nación Argentina y del Pueblo de la Provincia de {{provincia}}, y en virtud de lo mandando en la sentencia de fecha {{fecha_sentencia}}, dictada en estos autos:

**SE LE INTIMA:**

Para que dentro del plazo de {{plazo_dias}} días hábiles, bajo apercibimiento de que, en caso de no verificar el pago, se procederá a su cumplimiento coercitivo, se hará trance y remate de sus bienes, se affectarán los mismos兵马 bienes digitales hasta cubrir la suma total de:

| Concepto | Importe |
|----------|---------|
| Capital | \${{capital}} |
| Intereses | \${{intereses}} |
| Costas | \${{costas}} |
| **TOTAL** | **\${{total}}** |

---

**SÍRVASE DECIR:**

El presente mandamiento se libra en cumplimiento de la sentencia dictada en autos, la que ha adquirido autoridad de cosa juzgada.

---

**NOTIFIQUESE BAJO APERCIBIMIENTO DE LEY.**

{{ciudad}}, {{fecha}}

**FIRMA**

Dr./Dra. {{juez}}
Juez/za de Primera Instancia

**SECRETARIO**

{{secretario}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'provincia', tipo: 'texto', requerido: true, descripcion: 'Provincia' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula del caso' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'fecha_sentencia', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la sentencia' },
      { nombre: 'plazo_dias', tipo: 'numero', requerido: true, descripcion: 'Plazo en días' },
      { nombre: 'capital', tipo: 'texto', requerido: true, descripcion: 'Capital a cobrar' },
      { nombre: 'intereses', tipo: 'texto', requerido: false, descripcion: 'Intereses' },
      { nombre: 'costas', tipo: 'texto', requerido: false, descripcion: 'Costas' },
      { nombre: 'total', tipo: 'texto', requerido: true, descripcion: 'Total a cobrar' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha del mandamiento' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' },
      { nombre: 'secretario', tipo: 'texto', requerido: true, descripcion: 'Nombre del secretario' }
    ],
    ejemplo: 'Modelo de mandamiento de pago',
    activa: true
  },
  {
    titulo: 'Nota simple a Banco',
    categoria: 'nota',
    fuero: 'general',
    contenido: `{{ciudad}}, {{fecha}}

**Señores**
**{{nombre_banco}}**
**{{direccion_banco}}**

Ref.: Expediente N° {{expediente}} - "{{caratula}}"

De mi mayor consideración:

Por la presente, me dirijo a ustedes en relación al matter de la referencia, a fin de solicitar:

{{solicitud}}

Sin otro particular, saluda atte.

---

**Datos de contacto:**
{{abogado}}
Abogado - MBA N° {{matricula}}
Tel: {{telefono}}
Email: {{email}}`,
    variables: [
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' },
      { nombre: 'nombre_banco', tipo: 'texto', requerido: true, descripcion: 'Nombre del banco' },
      { nombre: 'direccion_banco', tipo: 'texto', requerido: false, descripcion: 'Dirección del banco' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula' },
      { nombre: 'solicitud', tipo: 'texto_largo', requerido: true, descripcion: 'Detalle de la solicitud' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'telefono', tipo: 'texto', requerido: false, descripcion: 'Teléfono' },
      { nombre: 'email', tipo: 'texto', requerido: false, descripcion: 'Email' }
    ],
    ejemplo: 'Nota simple a entidad bancaria',
    activa: true
  },
  {
    titulo: 'Escrito de Prueba Pericial',
    categoria: 'escrito',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, patrono de {{parte}}, en los autos arriba indicados, me presento y digo:

**OBJETO DE LA PERICIA**

Solicito se designe perito en la especialidad de {{especialidad}} a fin de verificar:

{{objeto_pericia}}

**CUESTIONES A DETERMINAR**

1. {{cuestion_1}}
2. {{cuestion_2}}
3. {{cuestion_3}}

**DOCUMENTACIÓN A ENTREGAR AL PERITO**

- {{documentacion}}

**PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por reproducido lo aquí expuesto.
2. Designe perito en {{especialidad}}.
3. Establezca honorarios profesionales conforme a la materia.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad del tribunal' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'parte', tipo: 'texto', requerido: true, descripcion: 'Parte que ofrece la prueba' },
      { nombre: 'especialidad', tipo: 'texto', requerido: true, descripcion: 'Especialidad del perito' },
      { nombre: 'objeto_pericia', tipo: 'texto_largo', requerido: true, descripcion: 'Objeto de la pericia' },
      { nombre: 'cuestion_1', tipo: 'texto', requerido: true, descripcion: 'Primera cuestión' },
      { nombre: 'cuestion_2', tipo: 'texto', requerido: false, descripcion: 'Segunda cuestión' },
      { nombre: 'cuestion_3', tipo: 'texto', requerido: false, descripcion: 'Tercera cuestión' },
      { nombre: 'documentacion', tipo: 'texto_largo', requerido: false, descripcion: 'Documentación para el perito' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de ofrecimiento de prueba pericial',
    activa: true
  },
  {
    titulo: 'Solicitud de Medida Cautelar',
    categoria: 'petitorio',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, patrono de {{actor}}, en los autos arriba indicados, me presento y digo:

**I. OBJETO**

Que vengo por el presente a solicitar se ordene la siguiente medida cautelar: {{medida_cautelar}}.

**II. FUNDAMENTOS**

La presente medida se fundamenta en:

**Fumus boni iuris:**
{{fumus}}

**Periculum in mora:**
{{periculum}}

**III. ANTECEDENTES**

{{antecedentes}}

**IV. GARANTÍA**

Ofrezco caución {{tipo_caucion}} por la suma de \${{monto_caucion}}.

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada esta solicitud.
2. Ordene la medida cautelar solicitada.
3. Declare su provisionalidad conforme lo establecido en el art. 195 CPCCN.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Actor' },
      { nombre: 'medida_cautelar', tipo: 'texto', requerido: true, descripcion: 'Tipo de medida cautelar' },
      { nombre: 'fumus', tipo: 'texto_largo', requerido: true, descripcion: 'Fumus boni iuris' },
      { nombre: 'periculum', tipo: 'texto_largo', requerido: true, descripcion: 'Periculum in mora' },
      { nombre: 'antecedentes', tipo: 'texto_largo', requerido: false, descripcion: 'Antecedentes relevantes' },
      { nombre: 'tipo_caucion', tipo: 'texto', requerido: true, descripcion: 'Tipo de caución' },
      { nombre: 'monto_caucion', tipo: 'texto', requerido: true, descripcion: 'Monto de la caución' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de solicitud de medida cautelar',
    activa: true
  },
  {
    titulo: 'Promoción de Prueba Testimonial',
    categoria: 'escrito',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{caratula}}

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, patrono de {{parte}}, en los autos arriba indicados, me presento y digo:

**OFRECIMIENTO DE PRUEBA TESTIMONIAL**

Que en legal tiempo y forma vengo a ofrecer la siguiente prueba testimonial:

**TESTIGOS:**

**1.** {{nombre_testigo_1}}, D.N.I. N° {{dni_testigo_1}}, con domicilio real en {{domicilio_testigo_1}}.
   - **Hechos a probar:** {{hechos_testigo_1}}

**2.** {{nombre_testigo_2}}, D.N.I. N° {{dni_testigo_2}}, con domicilio real en {{domicilio_testigo_2}}.
   - **Hechos a probar:** {{hechos_testigo_2}}

**3.** {{nombre_testigo_3}}, D.N.I. N° {{dni_testigo_3}}, con domicilio real en {{domicilio_testigo_3}}.
   - **Hechos a probar:** {{hechos_testigo_3}}

**PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por reproducido lo aquí expuesto.
2. Tenga por ofrecida la prueba testimonial.
3. Ordene su práctica conforme a derecho.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'caratula', tipo: 'texto', requerido: true, descripcion: 'Carátula' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'parte', tipo: 'texto', requerido: true, descripcion: 'Parte que ofrece' },
      { nombre: 'nombre_testigo_1', tipo: 'texto', requerido: true, descripcion: 'Nombre testigo 1' },
      { nombre: 'dni_testigo_1', tipo: 'texto', requerido: true, descripcion: 'DNI testigo 1' },
      { nombre: 'domicilio_testigo_1', tipo: 'texto', requerido: true, descripcion: 'Domicilio testigo 1' },
      { nombre: 'hechos_testigo_1', tipo: 'texto_largo', requerido: true, descripcion: 'Hechos a probar 1' },
      { nombre: 'nombre_testigo_2', tipo: 'texto', requerido: false, descripcion: 'Nombre testigo 2' },
      { nombre: 'dni_testigo_2', tipo: 'texto', requerido: false, descripcion: 'DNI testigo 2' },
      { nombre: 'domicilio_testigo_2', tipo: 'texto', requerido: false, descripcion: 'Domicilio testigo 2' },
      { nombre: 'hechos_testigo_2', tipo: 'texto_largo', requerido: false, descripcion: 'Hechos a probar 2' },
      { nombre: 'nombre_testigo_3', tipo: 'texto', requerido: false, descripcion: 'Nombre testigo 3' },
      { nombre: 'dni_testigo_3', tipo: 'texto', requerido: false, descripcion: 'DNI testigo 3' },
      { nombre: 'domicilio_testigo_3', tipo: 'texto', requerido: false, descripcion: 'Domicilio testigo 3' },
      { nombre: 'hechos_testigo_3', tipo: 'texto_largo', requerido: false, descripcion: 'Hechos a probar 3' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de ofrecimiento de prueba testimonial',
    activa: true
  }
];

async function agregarPlantillas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    for (const plantilla of nuevasPlantillas) {
      const existe = await Plantilla.findOne({ titulo: plantilla.titulo });
      if (!existe) {
        await Plantilla.create(plantilla);
        console.log(`✓ Agregada: ${plantilla.titulo}`);
      } else {
        console.log(`- Ya existe: ${plantilla.titulo}`);
      }
    }

    const total = await Plantilla.countDocuments();
    console.log(`\nTotal de plantillas: ${total}`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

agregarPlantillas();
