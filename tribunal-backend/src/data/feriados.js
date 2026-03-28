const FERIADOS_2026 = [
  { fecha: '2026-01-01', nombre: 'Año Nuevo', tipo: 'nacional' },
  { fecha: '2026-02-16', nombre: 'Carnaval', tipo: 'nacional' },
  { fecha: '2026-02-17', nombre: 'Carnaval', tipo: 'nacional' },
  { fecha: '6-04', nombre: 'Feriado Turístico', tipo: 'nacional' },
  { fecha: '2026-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'nacional' },
  { fecha: '2026-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'nacional' },
  { fecha: '2026-04-03', nombre: 'Viernes Santo', tipo: 'nacional' },
  { fecha: '2026-05-01', nombre: 'Día del Trabajador', tipo: 'nacional' },
  { fecha: '2026-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'nacional' },
  { fecha: '2026-06-15', nombre: 'Paso a la Inmortalidad del Gral. Don Martín Miguel de Güemes', tipo: 'nacional' },
  { fecha: '2026-06-20', nombre: 'Paso a la Inmortalidad del Gral. Don Manuel Belgrano', tipo: 'nacional' },
  { fecha: '2026-07-09', nombre: 'Día de la Independencia', tipo: 'nacional' },
  { fecha: '2026-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'nacional' },
  { fecha: '2026-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'nacional' },
  { fecha: '2026-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'nacional' },
  { fecha: '2026-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'nacional' },
  { fecha: '2026-12-25', nombre: 'Navidad', tipo: 'nacional' },
  
  { fecha: '2026-07-20', nombre: 'Feriado de la Ciudad de Buenos Aires', tipo: 'caba' },
  { fecha: '2026-08-02', nombre: 'Feriado de la Ciudad de Buenos Aires', tipo: 'caba' },
];

const FERIADOS_2025 = [
  { fecha: '2025-01-01', nombre: 'Año Nuevo', tipo: 'nacional' },
  { fecha: '2025-03-03', nombre: 'Carnaval', tipo: 'nacional' },
  { fecha: '2025-03-04', nombre: 'Carnaval', tipo: 'nacional' },
  { fecha: '2025-03-24', nombre: 'Día Nacional de la Memoria por la Verdad y la Justicia', tipo: 'nacional' },
  { fecha: '2025-04-02', nombre: 'Día del Veterano y de los Caídos en la Guerra de Malvinas', tipo: 'nacional' },
  { fecha: '2025-04-18', nombre: 'Viernes Santo', tipo: 'nacional' },
  { fecha: '2025-05-01', nombre: 'Día del Trabajador', tipo: 'nacional' },
  { fecha: '2025-05-25', nombre: 'Día de la Revolución de Mayo', tipo: 'nacional' },
  { fecha: '2025-06-16', nombre: 'Paso a la Inmortalidad del Gral. Don Martín Miguel de Güemes', tipo: 'nacional' },
  { fecha: '2025-06-20', nombre: 'Paso a la Inmortalidad del Gral. Don Manuel Belgrano', tipo: 'nacional' },
  { fecha: '2025-07-09', nombre: 'Día de la Independencia', tipo: 'nacional' },
  { fecha: '2025-08-17', nombre: 'Paso a la Inmortalidad del Gral. José de San Martín', tipo: 'nacional' },
  { fecha: '2025-10-12', nombre: 'Día del Respeto a la Diversidad Cultural', tipo: 'nacional' },
  { fecha: '2025-11-20', nombre: 'Día de la Soberanía Nacional', tipo: 'nacional' },
  { fecha: '2025-12-08', nombre: 'Inmaculada Concepción de María', tipo: 'nacional' },
  { fecha: '2025-12-25', nombre: 'Navidad', tipo: 'nacional' },
  
  { fecha: '2025-07-20', nombre: 'Feriado de la Ciudad de Buenos Aires', tipo: 'caba' },
  { fecha: '2025-08-02', nombre: 'Feriado de la Ciudad de Buenos Aires', tipo: 'caba' },
];

const FERIADOS = [...FERIADOS_2025, ...FERIADOS_2026];

const FERIAS_JUDICIALES = [
  { 
    nombre: 'Ferias de Enero', 
    inicio: '2026-01-01', 
    fin: '2026-01-31',
    tipo: 'enero'
  },
  { 
    nombre: 'Ferias de Julio', 
    inicio: '2026-07-01', 
    fin: '2026-07-31',
    tipo: 'julio'
  },
];

module.exports = { FERIADOS, FERIAS_JUDICIALES };
