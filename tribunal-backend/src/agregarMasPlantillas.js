const mongoose = require('mongoose');

require('dotenv').config();

const Plantilla = require('./models/Plantilla');

const plantillasAdicionales = [
  {
    titulo: 'Demanda de Divorce',
    categoria: 'demanda',
    fuero: 'familia',
    contenido: `JUZGADO DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{actor}} c/ {{demandado}} s/ Divorcio

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, en mi carácter de letrado patrocinante de {{actor}}, con domicilio procesal en {{domicilio_procesal}}, en los autos arriba indicados, ante V.S. me presento y digo:

**I. PARTES**

**ACTOR:** {{actor}}, {{tipo_documento}} N° {{documento_actor}}, con domicilio en {{domicilio_real}}.

**DEMANDADO:** {{demandado}}, {{tipo_documento_dem}} N° {{documento_dem}}, con domicilio en {{domicilio_dem}}.

**II. HECHOS**

Con fecha {{fecha_matrimonio}} contraje matrimonio con {{demandado}} por el Registro Civil de {{lugar_matrimonio}}.

Del vínculo matrimonial nacieron los siguientes hijos: {{hijos}}.

Depuis hace {{tiempo_separacion}} nos encontramos separados de hecho, sin perspectivas de reconciliación.

**III. FUNDAMENTOS JURÍDICOS**

Fundamento la presente en los artículos 316 y concordantes del Código Civil y Comercial de la Nación.

**IV. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada la demanda y por constituidos los domicilios procesales.
2. Declare el divorcio vincular de {{actor}} y {{demandado}}.
3. Establezca los siguientes regimenes respecto de los hijos: {{regimen_hijos}}.
4. Regule los honorarios profesionales.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del actor' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre del demandado' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'domicilio_procesal', tipo: 'texto', requerido: true, descripcion: 'Domicilio procesal' },
      { nombre: 'tipo_documento', tipo: 'texto', requerido: true, descripcion: 'Tipo de documento (DNI)' },
      { nombre: 'documento_actor', tipo: 'texto', requerido: true, descripcion: 'Número de documento actor' },
      { nombre: 'domicilio_real', tipo: 'texto', requerido: true, descripcion: 'Domicilio real actor' },
      { nombre: 'tipo_documento_dem', tipo: 'texto', requerido: false, descripcion: 'Tipo de documento demandado' },
      { nombre: 'documento_dem', tipo: 'texto', requerido: false, descripcion: 'Documento demandado' },
      { nombre: 'domicilio_dem', tipo: 'texto', requerido: false, descripcion: 'Domicilio demandado' },
      { nombre: 'fecha_matrimonio', tipo: 'fecha', requerido: true, descripcion: 'Fecha del matrimonio' },
      { nombre: 'lugar_matrimonio', tipo: 'texto', requerido: true, descripcion: 'Lugar del matrimonio' },
      { nombre: 'hijos', tipo: 'texto', requerido: true, descripcion: 'Hijos del matrimonio' },
      { nombre: 'tiempo_separacion', tipo: 'texto', requerido: true, descripcion: 'Tiempo de separación' },
      { nombre: 'regimen_hijos', tipo: 'texto_largo', requerido: false, descripcion: 'Régimen de visitas/ alimentos' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de demanda de divorcio',
    activa: true
  },
  {
    titulo: 'Reclamo de Alimentos',
    categoria: 'petitorio',
    fuero: 'familia',
    contenido: `JUZGADO DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{actor}} c/ {{demandado}} s/ Alimentos

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, en mi carácter de letrado patrocinante de {{actor}}, en los autos arriba indicados, ante V.S. me presento y digo:

**I. OBJETO**

Que vengo por el presente a reclamar alimentos en favor de {{beneficiario}} conforme lo establecido en el artículo 659 del Código Civil y Comercial de la Nación.

**II. HECHOS**

{{beneficiario}} es hijo/hija de {{actor}} y {{demandado}}, nacido/a el {{fecha_nacimiento}} en {{lugar_nacimiento}}.

{{demandado}} no cumple con su obligación alimentaria, dejando a {{beneficiario}} en estado de necesidad.

**III. NECESIDADES DEL BENEFICIARIO**

Las necesidades de {{beneficiario}} incluyen:

- Alimentación: \${{monto_alimentacion}} mensuales
- Educación: \${{monto_educacion}} mensuales
- Salud: \${{monto_salud}} mensuales
- Vestimenta y otros: \${{monto_otros}} mensuales

**IV. CAPACIDAD DEL OBLIGADO**

El demandado {{demandado}} percibe ingresos aproximados de \${{ingresos_demandado}} mensuales.

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada la demanda y por constituido el domicilio procesal.
2. Condene a {{demandado}} a pagar alimentos en favor de {{beneficiario}} equivalente al {{porcentaje}}% de sus ingresos.
3. Establezca el modo de pago y fecha de cobro.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Actor (madre/padre)' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Demandado' },
      { nombre: 'beneficiario', tipo: 'texto', requerido: true, descripcion: 'Hijo que recibe alimentos' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'fecha_nacimiento', tipo: 'fecha', requerido: true, descripcion: 'Fecha de nacimiento del hijo' },
      { nombre: 'lugar_nacimiento', tipo: 'texto', requerido: true, descripcion: 'Lugar de nacimiento' },
      { nombre: 'monto_alimentacion', tipo: 'texto', requerido: true, descripcion: 'Monto alimentación' },
      { nombre: 'monto_educacion', tipo: 'texto', requerido: false, descripcion: 'Monto educación' },
      { nombre: 'monto_salud', tipo: 'texto', requerido: false, descripcion: 'Monto salud' },
      { nombre: 'monto_otros', tipo: 'texto', requerido: false, descripcion: 'Otros gastos' },
      { nombre: 'ingresos_demandado', tipo: 'texto', requerido: false, descripcion: 'Ingresos del demandado' },
      { nombre: 'porcentaje', tipo: 'texto', requerido: false, descripcion: 'Porcentaje solicitado' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de reclamo de alimentos',
    activa: true
  },
  {
    titulo: 'Demanda Laboral',
    categoria: 'demanda',
    fuero: 'laboral',
    contenido: `JUZGADO DEL TRABAJO N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{actor}} c/ {{demandado}} s/ Despido

**SEÑOR JUEZ:**

{{abogado}}, T° {{tomo}} F° {{folio}}, en mi carácter de letrado patrocinante de {{actor}}, con domicilio procesal en {{domicilio_procesal}}, en los autos arriba indicados, ante V.S. me presento y digo:

**I. PARTES**

**DEMANDANTE:** {{actor}}, CUIL N° {{cuit_actor}}, de ocupación {{ocupacion}}, con domicilio real en {{domicilio_real}}.

**DEMANDADA:** {{demandado}}, CUIT N° {{cuit_demandado}}, con domicilio en {{domicilio_empresa}}.

**II. RELACIÓN LABORAL**

Mi mandante prestó servicios para la demandada desde el {{fecha_ingreso}} hasta el {{fecha_despido}}, bajo la dependencia subordinada y dirección de la misma.

La remuneración mensual era de \${{sueldo}} más {{beneficios}}.

**III. HECHOS**

Con fecha {{fecha_despido}}, mi poderdante fue intimado/a mediante {{tipo_intimacion}} a trabajar en {{lugar_nuevo_trabajo}}, con modificación sustancial de las condiciones de trabajo.

Dicha intimación constituye un acto de hostigamiento que configuró el distracto иск下去的.

**IV. CRONOGRAMA DE HABERES**

| Período | Concepto | Importe |
|---------|----------|---------|
| Preaviso | {{meses_preaviso}} meses | \${{monto_preaviso}} |
| Integración mes despido | Días | \${{monto_integracion}} |
| Indemnización antigüedad | {{años_antiguedad}} años | \${{monto_antiguedad}} |
| Vacaciones proporcionales | Días | \${{monto_vacaciones}} |
| SAC proporcional | | \${{monto_sac}} |
| Indemnización المقال 245 LCT | | \${{monto_245}} |

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada la demanda.
2. Declare la existencia de relación laboral y el distracto иск下去的.
3. Condene a {{demandado}} al pago de las sumas indicadas.
4. Imponga las costas a la demandada.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - T° {{tomo}} F° {{folio}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Nombre del trabajador' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Nombre de la empresa' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'tomo', tipo: 'texto', requerido: true, descripcion: 'Tomo del Colegio' },
      { nombre: 'folio', tipo: 'texto', requerido: true, descripcion: 'Folio' },
      { nombre: 'domicilio_procesal', tipo: 'texto', requerido: true, descripcion: 'Domicilio procesal' },
      { nombre: 'cuit_actor', tipo: 'texto', requerido: true, descripcion: 'CUIL del trabajador' },
      { nombre: 'ocupacion', tipo: 'texto', requerido: true, descripcion: 'Ocupación' },
      { nombre: 'domicilio_real', tipo: 'texto', requerido: true, descripcion: 'Domicilio real' },
      { nombre: 'cuit_demandado', tipo: 'texto', requerido: true, descripcion: 'CUIT empresa' },
      { nombre: 'domicilio_empresa', tipo: 'texto', requerido: true, descripcion: 'Domicilio empresa' },
      { nombre: 'fecha_ingreso', tipo: 'fecha', requerido: true, descripcion: 'Fecha de ingreso' },
      { nombre: 'fecha_despido', tipo: 'fecha', requerido: true, descripcion: 'Fecha de despido' },
      { nombre: 'sueldo', tipo: 'texto', requerido: true, descripcion: 'Sueldo mensual' },
      { nombre: 'beneficios', tipo: 'texto', requerido: false, descripcion: 'Otros beneficios' },
      { nombre: 'tipo_intimacion', tipo: 'texto', requerido: true, descripcion: 'Tipo de intimación' },
      { nombre: 'lugar_nuevo_trabajo', tipo: 'texto', requerido: false, descripcion: 'Nuevo lugar de trabajo' },
      { nombre: 'meses_preaviso', tipo: 'texto', requerido: false, descripcion: 'Meses de preaviso' },
      { nombre: 'monto_preaviso', tipo: 'texto', requerido: false, descripcion: 'Importe preaviso' },
      { nombre: 'años_antiguedad', tipo: 'texto', requerido: false, descripcion: 'Años de antigüedad' },
      { nombre: 'monto_antiguedad', tipo: 'texto', requerido: false, descripcion: 'Indemnización antigüedad' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de demanda laboral por despido',
    activa: true
  },
  {
    titulo: 'Denuncia Penal',
    categoria: 'demanda',
    fuero: 'penal',
    contenido: `MINISTERIO PÚBLICO FISCAL
{{ciudad}}

**DENUNCIA PENAL N° {{numero_denuncia}}

{{ciudad}}, {{fecha}}

**SEÑOR FISCAL:**

{{denunciante}}, {{tipo_documento}} N° {{documento_denunciante}}, con domicilio en {{domicilio_denunciante}}, ante V.S. me presento y digo:

**I. OBJETO**

Que vengo a denunciar ante V.S. a {{denunciado}}, {{tipo_documento_dem}} N° {{documento_denunciado}}, con domicilio en {{domicilio_denunciado}}, por considerarlo autor de los siguientes hechos:

**II. RELACIÓN DETALLADA DE LOS HECHOS**

El {{fecha_hecho}}, aproximadamente a las {{hora_hecho}}, en {{lugar_hecho}}, {{denunciado}}:

{{detalle_hechos}}

**III. PRUEBAS**

- {{prueba_1}}
- {{prueba_2}}
- {{prueba_3}}

**IV. FUNDAMENTOS JURÍDICOS**

Los hechos descriptos configuran los delitos de {{delitos}}, previstos y penados por los artículos {{articulos}} del Código Penal.

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada esta denuncia.
2. Ordene las medidas investigativas que considere pertinentes.
3. Cite a prestar declaración indagatoria a {{denunciado}}.

**ES JUSTICIA.**

{{denunciante}}
{{tipo_documento}} N° {{documento_denunciante}}`,
    variables: [
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'numero_denuncia', tipo: 'texto', requerido: true, descripcion: 'Número de denuncia' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' },
      { nombre: 'denunciante', tipo: 'texto', requerido: true, descripcion: 'Nombre del denunciante' },
      { nombre: 'tipo_documento', tipo: 'texto', requerido: true, descripcion: 'Tipo de documento' },
      { nombre: 'documento_denunciante', tipo: 'texto', requerido: true, descripcion: 'Documento denunciante' },
      { nombre: 'domicilio_denunciante', tipo: 'texto', requerido: true, descripcion: 'Domicilio denunciante' },
      { nombre: 'denunciado', tipo: 'texto', requerido: true, descripcion: 'Nombre del denunciado' },
      { nombre: 'tipo_documento_dem', tipo: 'texto', requerido: false, descripcion: 'Tipo documento denunciado' },
      { nombre: 'documento_denunciado', tipo: 'texto', requerido: false, descripcion: 'Documento denunciado' },
      { nombre: 'domicilio_denunciado', tipo: 'texto', requerido: false, descripcion: 'Domicilio denunciado' },
      { nombre: 'fecha_hecho', tipo: 'fecha', requerido: true, descripcion: 'Fecha del hecho' },
      { nombre: 'hora_hecho', tipo: 'texto', requerido: false, descripcion: 'Hora aproximada' },
      { nombre: 'lugar_hecho', tipo: 'texto', requerido: true, descripcion: 'Lugar del hecho' },
      { nombre: 'detalle_hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Detalle de lo ocurrido' },
      { nombre: 'prueba_1', tipo: 'texto', requerido: true, descripcion: 'Primera prueba' },
      { nombre: 'prueba_2', tipo: 'texto', requerido: false, descripcion: 'Segunda prueba' },
      { nombre: 'prueba_3', tipo: 'texto', requerido: false, descripcion: 'Tercera prueba' },
      { nombre: 'delitos', tipo: 'texto', requerido: true, descripcion: 'Tipo de delitos' },
      { nombre: 'articulos', tipo: 'texto', requerido: true, descripcion: 'Artículos del Código Penal' }
    ],
    ejemplo: 'Modelo de denuncia penal',
    activa: true
  },
  {
    titulo: 'Querella Penal',
    categoria: 'demanda',
    fuero: 'penal',
    contenido: `JUZGADO DE INSTRUCCIÓN N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{querellante}} c/ {{querellado}} s/ {{delito}}

**SEÑOR JUEZ:**

{{abogado}}, T° {{tomo}} F° {{folio}}, en mi carácter de letrado patrocinante de {{querellante}}, con domicilio procesal en {{domicilio_procesal}}, ante V.S. me presento y digo:

**I. DEL PARTIDO**

**QUERELLANTE:** {{querellante}}, {{tipo_documento}} N° {{documento}}, con domicilio en {{domicilio_real}}.

**QUERELLADO:** {{querellado}}, {{tipo_documento_2}} N° {{documento_2}}, con domicilio en {{domicilio_querellado}}.

**II. RELACIÓN DE LOS HECHOS**

El día {{fecha_hecho}}, {{querellado}}:

{{detalle_hechos}}

**III. LESIONES Y DAÑOS**

Como consecuencia de los hechos descriptos, mi poderdante sufrió:

- Lesiones: {{lesiones}}
- Daños materiales: {{danios}}
- Daño moral: {{daño_moral}}

**IV. FUNDAMENTOS JURÍDICOS**

Los hechos constituyen el delito de {{delito}}, previsto en el artículo {{articulo}} del Código Penal.

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por presentada la querella y por constituido el domicilio procesal.
2. Declare la acción penal extinguida respecto de {{querellante}}.
3. Ordene la instrucción de la presente causa.
4. Se decrete el procesamiento de {{querellado}}.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - T° {{tomo}} F° {{folio}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'querellante', tipo: 'texto', requerido: true, descripcion: 'Nombre del querellante' },
      { nombre: 'querellado', tipo: 'texto', requerido: true, descripcion: 'Nombre del querellado' },
      { nombre: 'delito', tipo: 'texto', requerido: true, descripcion: 'Delito por el que se querella' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'tomo', tipo: 'texto', requerido: true, descripcion: 'Tomo' },
      { nombre: 'folio', tipo: 'texto', requerido: true, descripcion: 'Folio' },
      { nombre: 'domicilio_procesal', tipo: 'texto', requerido: true, descripcion: 'Domicilio procesal' },
      { nombre: 'tipo_documento', tipo: 'texto', requerido: true, descripcion: 'Tipo de documento' },
      { nombre: 'documento', tipo: 'texto', requerido: true, descripcion: 'Documento querellante' },
      { nombre: 'domicilio_real', tipo: 'texto', requerido: true, descripcion: 'Domicilio real' },
      { nombre: 'tipo_documento_2', tipo: 'texto', requerido: false, descripcion: 'Tipo documento querellado' },
      { nombre: 'documento_2', tipo: 'texto', requerido: false, descripcion: 'Documento querellado' },
      { nombre: 'domicilio_querellado', tipo: 'texto', requerido: false, descripcion: 'Domicilio querellado' },
      { nombre: 'fecha_hecho', tipo: 'fecha', requerido: true, descripcion: 'Fecha del hecho' },
      { nombre: 'detalle_hechos', tipo: 'texto_largo', requerido: true, descripcion: 'Detalle de los hechos' },
      { nombre: 'lesiones', tipo: 'texto_largo', requerido: false, descripcion: 'Descripción de lesiones' },
      { nombre: 'danios', tipo: 'texto', requerido: false, descripcion: 'Daños materiales' },
      { nombre: 'daño_moral', tipo: 'texto', requerido: false, descripcion: 'Daño moral' },
      { nombre: 'articulo', tipo: 'texto', requerido: true, descripcion: 'Artículo del Código Penal' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de querella penal',
    activa: true
  },
  {
    titulo: 'Despacho desthastrado',
    categoria: 'escrito',
    fuero: 'laboral',
    contenido: `JUZGADO DEL TRABAJO N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{actor}} c/ {{demandado}} s/ Despido

**DESPACHO**

---

En la Ciudad de {{ciudad}}, a {{fecha}}, siendo las {{hora}}, se hace saber a las partes que se ha dictado la siguiente resolución:

**VISTOS:**

Los presentes autos de la referencia, y;

**CONSIDERANDO:**

Que de las constancias de autos surge que {{actor}} prestó servicios para {{demandado}} desde {{fecha_ingreso}}.

Que con fecha {{fecha_despido}} se produjera el distracto иск下去的.

Que corresponde analizar los montos reclamados.

**RESUELVE:**

1. DECLARAR que la relación laboral se extinguió por voluntad del empleador con fecha {{fecha_despido}}.
2. CONDENAR a {{demandado}} a pagar a {{actor}}:
   - Indemnización por antigüedad: \${{indem_antiguedad}}
   - Preaviso: \${{preaviso}}
   - Integración mes de despido: \${{integracion}}
   - Vacaciones proporcionales: \${{vacaciones}}
   - SAC proporcional: \${{sac}}
   - Indemnización artículo 245 LCT: \${{art245}}
   - TOTAL: \${{total}}
3. IMPONER las costas a la demandada.

**FIRMA**

Dr./Dra. {{juez}}
Juez/za del Trabajo`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'actor', tipo: 'texto', requerido: true, descripcion: 'Trabajador' },
      { nombre: 'demandado', tipo: 'texto', requerido: true, descripcion: 'Empresa' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha de la resolución' },
      { nombre: 'hora', tipo: 'texto', requerido: false, descripcion: 'Hora' },
      { nombre: 'fecha_ingreso', tipo: 'fecha', requerido: true, descripcion: 'Fecha de ingreso' },
      { nombre: 'fecha_despido', tipo: 'fecha', requerido: true, descripcion: 'Fecha de despido' },
      { nombre: 'indem_antiguedad', tipo: 'texto', requerido: false, descripcion: 'Indemnización antigüedad' },
      { nombre: 'preaviso', tipo: 'texto', requerido: false, descripcion: 'Monto preaviso' },
      { nombre: 'integracion', tipo: 'texto', requerido: false, descripcion: 'Integración mes' },
      { nombre: 'vacaciones', tipo: 'texto', requerido: false, descripcion: 'Vacaciones proporcionales' },
      { nombre: 'sac', tipo: 'texto', requerido: false, descripcion: 'SAC proporcional' },
      { nombre: 'art245', tipo: 'texto', requerido: false, descripcion: 'Indemnización art 245' },
      { nombre: 'total', tipo: 'texto', requerido: false, descripcion: 'Total a pagar' },
      { nombre: 'juez', tipo: 'texto', requerido: true, descripcion: 'Nombre del juez' }
    ],
    ejemplo: 'Modelo de despacho en juicio laboral',
    activa: true
  },
  {
    titulo: 'Sucesión Ab Intestato',
    categoria: 'demanda',
    fuero: 'civil',
    contenido: `JUZGADO DE PRIMERA INSTANCIA EN LO CIVIL Y COMERCIAL N° {{juzgado}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

**CARATULA:** {{solicitante}} s/ Sucesión Ab Intestato

**SEÑOR JUEZ:**

{{abogado}}, MBA N° {{matricula}}, en mi carácter de letrado patrocinante de {{solicitante}}, con domicilio procesal en {{domicilio_procesal}}, en los autos arriba indicados, ante V.S. me presento y digo:

**I. OBJETO**

Que vengo a iniciar el presente juicio de sucesión ab intestato de quien en vida se llamó {{causante}}, {{tipo_doc}} N° {{documento_causante}}, quien/falleciera el {{fecha_fallecimiento}} en {{lugar_fallecimiento}}.

**II. DEL CAUSANTE**

El/la causante era de estado civil {{estado_civil}}, avecinado en {{domicilio_causante}}.

**III. DE LOS HEREDEROS**

Son herederos forzosos del/la causante:

1. {{heredero_1}}, {{tipo_doc_1}} N° {{doc_heredero_1}}, en su carácter de {{parentesco_1}}.
2. {{heredero_2}}, {{tipo_doc_2}} N° {{doc_heredero_2}}, en su carácter de {{parentesco_2}}.
3. {{heredero_3}}, {{tipo_doc_3}} N° {{doc_heredero_3}}, en su carácter de {{parentesco_3}}.

**IV. DEL PATRIMONIO**

El patrimonio del/la causante se compone de:

- {{bien_1}}: \${{valor_1}}
- {{bien_2}}: \${{valor_2}}
- Saldo bancario: \${{saldo_bancario}}

**V. PETICIÓN**

Por todo lo expuesto, a V.S. solicito:

1. Tenga por iniciada la sucesión ab intestato de {{causante}}.
2. Declare quiénes son los herederos del/la causante.
3. Ordene la inscripción del auto de declaratoria de herederos en el Registro de la Propiedad.

**ES JUSTICIA.**

{{ciudad}}, {{fecha}}

---
{{abogado}}
Abogado - MBA N° {{matricula}}`,
    variables: [
      { nombre: 'juzgado', tipo: 'texto', requerido: true, descripcion: 'Número de juzgado' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: true, descripcion: 'Número de expediente' },
      { nombre: 'solicitante', tipo: 'texto', requerido: true, descripcion: 'Quien solicita la sucesión' },
      { nombre: 'abogado', tipo: 'texto', requerido: true, descripcion: 'Nombre del abogado' },
      { nombre: 'matricula', tipo: 'texto', requerido: true, descripcion: 'Matrícula' },
      { nombre: 'domicilio_procesal', tipo: 'texto', requerido: true, descripcion: 'Domicilio procesal' },
      { nombre: 'causante', tipo: 'texto', requerido: true, descripcion: 'Nombre del causante' },
      { nombre: 'tipo_doc', tipo: 'texto', requerido: true, descripcion: 'Tipo de documento' },
      { nombre: 'documento_causante', tipo: 'texto', requerido: true, descripcion: 'Documento del causante' },
      { nombre: 'fecha_fallecimiento', tipo: 'fecha', requerido: true, descripcion: 'Fecha de fallecimiento' },
      { nombre: 'lugar_fallecimiento', tipo: 'texto', requerido: true, descripcion: 'Lugar de fallecimiento' },
      { nombre: 'estado_civil', tipo: 'texto', requerido: true, descripcion: 'Estado civil' },
      { nombre: 'domicilio_causante', tipo: 'texto', requerido: true, descripcion: 'Último domicilio' },
      { nombre: 'heredero_1', tipo: 'texto', requerido: true, descripcion: 'Heredero 1' },
      { nombre: 'tipo_doc_1', tipo: 'texto', requerido: true, descripcion: 'Tipo doc heredero 1' },
      { nombre: 'doc_heredero_1', tipo: 'texto', requerido: true, descripcion: 'Documento heredero 1' },
      { nombre: 'parentesco_1', tipo: 'texto', requerido: true, descripcion: 'Parentesco heredero 1' },
      { nombre: 'heredero_2', tipo: 'texto', requerido: false, descripcion: 'Heredero 2' },
      { nombre: 'tipo_doc_2', tipo: 'texto', requerido: false, descripcion: 'Tipo doc heredero 2' },
      { nombre: 'doc_heredero_2', tipo: 'texto', requerido: false, descripcion: 'Documento heredero 2' },
      { nombre: 'parentesco_2', tipo: 'texto', requerido: false, descripcion: 'Parentesco heredero 2' },
      { nombre: 'heredero_3', tipo: 'texto', requerido: false, descripcion: 'Heredero 3' },
      { nombre: 'tipo_doc_3', tipo: 'texto', requerido: false, descripcion: 'Tipo doc heredero 3' },
      { nombre: 'doc_heredero_3', tipo: 'texto', requerido: false, descripcion: 'Documento heredero 3' },
      { nombre: 'parentesco_3', tipo: 'texto', requerido: false, descripcion: 'Parentesco heredero 3' },
      { nombre: 'bien_1', tipo: 'texto', requerido: false, descripcion: 'Bien 1' },
      { nombre: 'valor_1', tipo: 'texto', requerido: false, descripcion: 'Valor bien 1' },
      { nombre: 'bien_2', tipo: 'texto', requerido: false, descripcion: 'Bien 2' },
      { nombre: 'valor_2', tipo: 'texto', requerido: false, descripcion: 'Valor bien 2' },
      { nombre: 'saldo_bancario', tipo: 'texto', requerido: false, descripcion: 'Saldo bancario' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de sucesión ab intestato',
    activa: true
  },
  {
    titulo: 'Reglamento de Expensas',
    categoria: 'otro',
    fuero: 'civil',
    contenido: `REGLAMENTO DE EXPENSAS
Consorcio de Propietarios {{nombre_consorcio}}
{{ciudad}}

**EXPEDIENTE N°:** {{expediente}}

---

**I. EXPENSAS ORDINARIAS**

Las expensas ordinarias incluyen:

1. **Gastos de administración:** \${{admin_mensual}}/mes
2. **Limpieza:** \${{limpieza_mensual}}/mes
3. **Ascensor:** \${{ascensor_mensual}}/mes
4. **Luz palieres y zonas comunes:** \${{luz_mensual}}/mes
5. **Mantenimiento general:** \${{mantenimiento_mensual}}/mes

**Total expensas ordinarias:** \${{total_ordinarias}}/mes

---

**II. EXPENSAS EXTRAORDINARIAS**

Se detallan las expensas extraordinarias aprobadas:

| Obra/Servicio | Importe Total | Cuota por Unidade | Período |
|---------------|---------------|-------------------|---------|
| {{obra_1}} | \${{importe_obra_1}} | \${{cuota_obra_1}} | {{periodo_obra_1}} |
| {{obra_2}} | \${{importe_obra_2}} | \${{cuota_obra_2}} | {{periodo_obra_2}} |

---

**III. FECHAS DE VENCIMIENTO**

- Primera cuota: {{fecha_1er_vencimiento}} de cada mes
- Segunda cuota: {{fecha_2do_vencimiento}} de cada mes

**Interés por mora:** {{tasa_mora}}% mensual

---

**IV. UNIDADES FUNCIONALES**

| UF | Propietario | Porcentaje |
|----|-------------|------------|
| {{uf_1}} | {{prop_uf_1}} | {{porc_uf_1}}% |
| {{uf_2}} | {{prop_uf_2}} | {{porc_uf_2}}% |
| {{uf_3}} | {{prop_uf_3}} | {{porc_uf_3}}% |

---

**V. MORA Y COBRANZA**

El incumplimiento en el pago de expensas generará:

1. Interés resarcitorio del {{tasa_mora}}% mensual
2. Interés punitorio del {{tasa_punitoria}}% mensual
3. Gastos de cobranza extrajudicial
4. Acción judicial de cobranza

---

{{ciudad}}, {{fecha}}

**Administración:**
{{admin_nombre}}
{{admin_contacto}}`,
    variables: [
      { nombre: 'nombre_consorcio', tipo: 'texto', requerido: true, descripcion: 'Nombre del consorcio' },
      { nombre: 'ciudad', tipo: 'texto', requerido: true, descripcion: 'Ciudad' },
      { nombre: 'expediente', tipo: 'texto', requerido: false, descripcion: 'Expediente (si hay)' },
      { nombre: 'admin_mensual', tipo: 'texto', requerido: true, descripcion: 'Gastos administración' },
      { nombre: 'limpieza_mensual', tipo: 'texto', requerido: true, descripcion: 'Limpieza' },
      { nombre: 'ascensor_mensual', tipo: 'texto', requerido: false, descripcion: 'Ascensor' },
      { nombre: 'luz_mensual', tipo: 'texto', requerido: true, descripcion: 'Luz zonas comunes' },
      { nombre: 'mantenimiento_mensual', tipo: 'texto', requerido: false, descripcion: 'Mantenimiento' },
      { nombre: 'total_ordinarias', tipo: 'texto', requerido: true, descripcion: 'Total ordinario' },
      { nombre: 'obra_1', tipo: 'texto', requerido: false, descripcion: 'Obra extraordinaria 1' },
      { nombre: 'importe_obra_1', tipo: 'texto', requerido: false, descripcion: 'Importe obra 1' },
      { nombre: 'cuota_obra_1', tipo: 'texto', requerido: false, descripcion: 'Cuota obra 1' },
      { nombre: 'periodo_obra_1', tipo: 'texto', requerido: false, descripcion: 'Período obra 1' },
      { nombre: 'obra_2', tipo: 'texto', requerido: false, descripcion: 'Obra extraordinaria 2' },
      { nombre: 'importe_obra_2', tipo: 'texto', requerido: false, descripcion: 'Importe obra 2' },
      { nombre: 'cuota_obra_2', tipo: 'texto', requerido: false, descripcion: 'Cuota obra 2' },
      { nombre: 'periodo_obra_2', tipo: 'texto', requerido: false, descripcion: 'Período obra 2' },
      { nombre: 'fecha_1er_vencimiento', tipo: 'texto', requerido: true, descripcion: 'Fecha 1er vencimiento' },
      { nombre: 'fecha_2do_vencimiento', tipo: 'texto', requerido: false, descripcion: 'Fecha 2do vencimiento' },
      { nombre: 'tasa_mora', tipo: 'texto', requerido: true, descripcion: 'Tasa interés mora' },
      { nombre: 'tasa_punitoria', tipo: 'texto', requerido: false, descripcion: 'Tasa punitoria' },
      { nombre: 'uf_1', tipo: 'texto', requerido: false, descripcion: 'UF 1' },
      { nombre: 'prop_uf_1', tipo: 'texto', requerido: false, descripcion: 'Propietario UF 1' },
      { nombre: 'porc_uf_1', tipo: 'texto', requerido: false, descripcion: 'Porcentaje UF 1' },
      { nombre: 'admin_nombre', tipo: 'texto', requerido: true, descripcion: 'Nombre administrador' },
      { nombre: 'admin_contacto', tipo: 'texto', requerido: false, descripcion: 'Contacto administración' },
      { nombre: 'fecha', tipo: 'fecha', requerido: true, descripcion: 'Fecha' }
    ],
    ejemplo: 'Modelo de reglamento de expensas',
    activa: true
  }
];

async function agregarMasPlantillas() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    let agregadas = 0;
    for (const plantilla of plantillasAdicionales) {
      const existe = await Plantilla.findOne({ titulo: plantilla.titulo });
      if (!existe) {
        await Plantilla.create(plantilla);
        console.log(`✓ Agregada: ${plantilla.titulo}`);
        agregadas++;
      } else {
        console.log(`- Ya existe: ${plantilla.titulo}`);
      }
    }

    const total = await Plantilla.countDocuments();
    console.log(`\nTotal de plantillas: ${total}`);
    console.log(`Nuevas agregadas: ${agregadas}`);

    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

agregarMasPlantillas();
