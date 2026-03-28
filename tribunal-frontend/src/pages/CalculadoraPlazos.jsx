import { useState } from 'react';
import { addDays, format, isWeekend, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const FERIADOS_2025_2026 = [
  '2025-01-01', '2025-03-03', '2025-03-04', '2025-03-24', '2025-04-02', '2025-04-18',
  '2025-05-01', '2025-05-25', '2025-06-16', '2025-06-20', '2025-07-09', '2025-07-20',
  '2025-07-21', '2025-08-17', '2025-08-02', '2025-10-12', '2025-11-20', '2025-12-08',
  '2025-12-25', '2026-01-01', '2026-02-16', '2026-02-17', '2026-03-24', '2026-04-02',
  '2026-04-03', '2026-05-01', '2026-05-25', '2026-06-15', '2026-06-20', '2026-07-09',
  '2026-07-20', '2026-08-17', '2026-10-12', '2026-11-20', '2026-12-08', '2026-12-25',
];

const isFeriado = (date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return FERIADOS_2025_2026.includes(dateStr);
};

const isDiaHabil = (date) => {
  return !isWeekend(date) && !isFeriado(date);
};

const sumarDiasHabiles = (fecha, dias) => {
  let fechaActual = parseISO(fecha);
  let diasAgregados = 0;
  
  while (diasAgregados < dias) {
    fechaActual = addDays(fechaActual, 1);
    if (isDiaHabil(fechaActual)) {
      diasAgregados++;
    }
  }
  
  return fechaActual;
};

const sumarDiasCorridos = (fecha, dias) => {
  return addDays(parseISO(fecha), dias);
};

export default function CalculadoraPlazos() {
  const [fechaInicio, setFechaInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dias, setDias] = useState(10);
  const [tipo, setTipo] = useState('habil');
  const [resultado, setResultado] = useState(null);
  const [detalle, setDetalle] = useState([]);

  const calcular = () => {
    let fechaResultante;
    if (tipo === 'habil') {
      fechaResultante = sumarDiasHabiles(fechaInicio, dias);
    } else {
      fechaResultante = sumarDiasCorridos(fechaInicio, dias);
    }
    
    setResultado(fechaResultante);
    
    const detalles = [];
    let fechaTemp = parseISO(fechaInicio);
    
    for (let i = 1; i <= Math.min(30, dias * 2); i++) {
      const fecha = addDays(fechaTemp, i);
      if (tipo === 'habil' && !isDiaHabil(fecha)) continue;
      if (detalles.length < dias) {
        detalles.push({
          fecha: format(fecha, 'dd/MM/yyyy'),
          tipo: isFeriado(fecha) ? 'Feriado' : 'Dia habil'
        });
      }
    }
    
    setDetalle(detalles);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Calculadora de Plazos Procesales</h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Datos del Calculo</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad de Dias</label>
            <input
              type="number"
              min="1"
              max="365"
              value={dias}
              onChange={(e) => setDias(parseInt(e.target.value) || 0)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Plazo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="habil">Dias Habiles</option>
              <option value="corrido">Dias Corridos</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={calcular}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Calcular Fecha de Vencimiento
        </button>
      </div>

      {resultado && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Resultado</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center mb-6">
            <p className="text-sm text-blue-600 mb-1">Fecha de Vencimiento</p>
            <p className="text-4xl font-bold text-blue-800">
              {format(resultado, 'dd')} de {format(resultado, 'MMMM', { locale: es })} de {format(resultado, 'yyyy')}
            </p>
            <p className="text-lg text-blue-600 mt-2">
              ({format(resultado, 'EEEE', { locale: es })})
            </p>
          </div>
          
          {detalle.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Detalle de dias:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {detalle.map((d, i) => (
                  <div key={i} className={`text-sm p-2 rounded ${
                    d.tipo === 'Feriado' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                  }`}>
                    {d.fecha}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-yellow-50 rounded text-sm">
            <p className="font-medium">Recorda:</p>
            <ul className="list-disc list-inside text-gray-600 mt-1">
              <li>Las ferias judiciales suspenden los plazos (enero y julio)</li>
              <li>Verifica si hay suspension de terminos por acordada</li>
              <li>El computo incluye el dia de notificacion segun el tipo</li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Feriados Fijados 2025-2026</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {FERIADOS_2025_2026.slice(0, 12).map((f, i) => (
            <div key={i} className="p-2 bg-red-50 rounded text-red-700">
              {f}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mostrando primeros 12. Feriados completos disponibles en el calculo.
        </p>
      </div>
    </div>
  );
}
