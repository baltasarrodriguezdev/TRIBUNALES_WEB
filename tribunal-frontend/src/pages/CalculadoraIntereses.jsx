import { useState } from 'react';
import { format, differenceInDays, parseISO } from 'date-fns';

const TASAS_DEFAULT = [
  { tipo: 'tasa_activa_bcra', nombre: 'Tasa Activa BCRP ( TEA)', valor: 0.40 },
  { tipo: 'tasa_pasiva_bcra', nombre: 'Tasa Pasiva BCRP ( TEA)', valor: 0.26 },
  { tipo: 'tasa_judicial', nombre: 'Tasa Judicial (CABA)', valor: 0.30 },
  { tipo: 'tasa_usura', nombre: 'Tasa de Usura (BCRA)', valor: 0.80 },
];

const calcularInteresSimple = (capital, tasa, dias) => {
  return capital * (tasa / 365) * dias;
};

const calcularInteresCompuesto = (capital, tasa, dias) => {
  const tasaDiaria = Math.pow(1 + tasa, 1/365) - 1;
  return capital * (Math.pow(1 + tasaDiaria, dias) - 1);
};

export default function CalculadoraIntereses() {
  const [capital, setCapital] = useState(100000);
  const [tasa, setTasa] = useState(0.40);
  const [fechaInicio, setFechaInicio] = useState(format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoCalculo, setTipoCalculo] = useState('simple');
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const dias = differenceInDays(parseISO(fechaFin), parseISO(fechaInicio));
    const capitalNum = parseFloat(capital) || 0;
    const tasaNum = parseFloat(tasa) || 0;
    
    let intereses;
    if (tipoCalculo === 'simple') {
      intereses = calcularInteresSimple(capitalNum, tasaNum, dias);
    } else {
      intereses = calcularInteresCompuesto(capitalNum, tasaNum, dias);
    }
    
    const total = capitalNum + intereses;
    const tasaDiaria = (tasaNum / 365 * 100).toFixed(4);
    
    setResultado({
      capital: capitalNum,
      intereses,
      total,
      dias,
      tasaDiaria
    });
  };

  const aplicarTasa = (tasaObj) => {
    setTasa(tasaObj.valor);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Calculadora de Intereses</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Datos del Cálculo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Capital ($)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tasa Anual (decimal)</label>
                <input
                  type="number"
                  step="0.01"
                  value={tasa}
                  onChange={(e) => setTasa(parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="0.40"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tasa anual en formato decimal (0.40 = 40%)
                </p>
              </div>
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
                <label className="block text-sm font-medium mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Cálculo</label>
                <select
                  value={tipoCalculo}
                  onChange={(e) => setTipoCalculo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="simple">Interés Simple</option>
                  <option value="compuesto">Interés Compuesto</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={calcular}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            >
              Calcular Intereses
            </button>
          </div>

          {resultado && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Resultado</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-100 rounded p-4">
                  <p className="text-sm text-gray-500">Capital Original</p>
                  <p className="text-2xl font-bold">${resultado.capital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-green-100 rounded p-4">
                  <p className="text-sm text-green-600">Intereses Calculados</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${resultado.intereses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-blue-100 rounded p-4">
                  <p className="text-sm text-blue-600">Total (Capital + Intereses)</p>
                  <p className="text-3xl font-bold text-blue-800">
                    ${resultado.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-purple-100 rounded p-4">
                  <p className="text-sm text-purple-600">Período</p>
                  <p className="text-2xl font-bold text-purple-700">{resultado.dias} días</p>
                  <p className="text-sm text-purple-600">Tasa diaria: {resultado.tasaDiaria}%</p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded p-4 text-sm">
                <p className="font-medium text-yellow-800">Fórmula utilizada:</p>
                {tipoCalculo === 'simple' ? (
                  <p className="text-yellow-700 mt-1">
                    Interés = Capital × (Tasa Anual / 365) × Días
                  </p>
                ) : (
                  <p className="text-yellow-700 mt-1">
                    Interés = Capital × ((1 + Tasa Anual)^(Días/365) - 1)
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tasas de Referencia</h3>
            <p className="text-sm text-gray-500 mb-4">Hacé clic para aplicar</p>
            
            <div className="space-y-2">
              {TASAS_DEFAULT.map((tasa) => (
                <button
                  key={tasa.tipo}
                  onClick={() => aplicarTasa(tasa)}
                  className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
                >
                  <p className="font-medium text-sm">{tasa.nombre}</p>
                  <p className="text-blue-600">{(tasa.valor * 100).toFixed(0)}% anual</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-800">Nota:</p>
              <p className="text-blue-700 mt-1">
                Los intereses judiciales varían según la jurisdicción y tipo de causa.
                Consultá las tasas vigentes del tribunal correspondiente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
