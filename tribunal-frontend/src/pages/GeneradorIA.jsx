import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { jsPDF } from 'jspdf';

const PASOS = {
  SUBIR: 'subir',
  ANALIZAR: 'analizar',
  PLANTILLA: 'plantilla',
  GENERAR: 'generar',
  RESULTADO: 'resultado'
};

export default function GeneradorIA() {
  const [paso, setPaso] = useState(PASOS.SUBIR);
  const [archivo, setArchivo] = useState(null);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useAI, setUseAI] = useState(true);
  const [datosEditables, setDatosEditables] = useState(null);

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const cargarPlantillas = async () => {
    try {
      const res = await api.plantillas.getAll();
      if (res.success) {
        setPlantillas(res.data);
      }
    } catch (err) {
      console.error('Error cargando plantillas:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Formato no soportado. Use PDF, Word (.docx) o texto (.txt)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('El archivo es muy grande. Máximo 10MB');
        return;
      }
      
      setArchivo(file);
      setError(null);
    }
  };

  const analizarDocumento = async () => {
    if (!archivo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.generar.analizar(archivo);
      
      if (res.success) {
        setAnalisis(res.data);
        setDatosEditables(res.data.datosExtraidos);
        
        if (res.data.plantillaSugerida) {
          setPlantillaSeleccionada(res.data.plantillaSugerida._id);
        }
        
        setPaso(PASOS.PLANTILLA);
      } else {
        setError(res.error || 'Error al analizar documento');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el documento');
    } finally {
      setLoading(false);
    }
  };

  const generarEscrito = async () => {
    if (!plantillaSeleccionada) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.generar.generar(archivo, plantillaSeleccionada, useAI);
      
      if (res.success) {
        setResultado(res.data);
        setPaso(PASOS.RESULTADO);
      } else {
        setError(res.error || 'Error al generar escrito');
      }
    } catch (err) {
      setError(err.message || 'Error al generar el escrito');
    } finally {
      setLoading(false);
    }
  };

  const generarDirecto = async () => {
    if (!plantillaSeleccionada || !datosEditables) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.generar.generarDirecto(datosEditables, plantillaSeleccionada, useAI);
      
      if (res.success) {
        setResultado(res.data);
        setPaso(PASOS.RESULTADO);
      } else {
        setError(res.error || 'Error al generar escrito');
      }
    } catch (err) {
      setError(err.message || 'Error al generar el escrito');
    } finally {
      setLoading(false);
    }
  };

  const handleDatosChange = (campo, valor) => {
    setDatosEditables(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handlePartesChange = (subcampo, valor) => {
    setDatosEditables(prev => ({
      ...prev,
      partes: {
        ...prev.partes,
        [subcampo]: valor
      }
    }));
  };

  const copiarAlPortapapeles = () => {
    if (resultado?.escritoGenerado) {
      navigator.clipboard.writeText(resultado.escritoGenerado);
      alert('Escrito copiado al portapapeles');
    }
  };

  const descargarTexto = () => {
    if (resultado?.escritoGenerado) {
      const blob = new Blob([resultado.escritoGenerado], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `escrito_generado_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const descargarPDF = () => {
    if (resultado?.escritoGenerado) {
      const doc = new jsPDF();
      const lineas = resultado.escritoGenerado.split('\n');
      let y = 20;
      const margenIzquierdo = 20;
      const anchoMaximo = 170;
      const tamanoFuente = 10;
      
      doc.setFont('helvetica');
      doc.setFontSize(tamanoFuente);
      
      lineas.forEach((linea) => {
        const palabras = linea.split(' ');
        let lineaActual = '';
        
        palabras.forEach((palabra) => {
          const testLinea = lineaActual + palabra + ' ';
          const anchoLinea = doc.getTextWidth(testLinea);
          
          if (anchoLinea > anchoMaximo && lineaActual !== '') {
            doc.text(lineaActual.trim(), margenIzquierdo, y);
            lineaActual = palabra + ' ';
            y += 7;
            
            if (y > 280) {
              doc.addPage();
              y = 20;
            }
          } else {
            lineaActual = testLinea;
          }
        });
        
        if (lineaActual.trim()) {
          doc.text(lineaActual.trim(), margenIzquierdo, y);
        }
        y += 7;
        
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });
      
      doc.save(`escrito_${Date.now()}.pdf`);
    }
  };

  const reiniciar = () => {
    setPaso(PASOS.SUBIR);
    setArchivo(null);
    setAnalisis(null);
    setResultado(null);
    setError(null);
    setPlantillaSeleccionada(null);
    setDatosEditables(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Generador de Escritos con IA</h1>
        <p className="text-slate-600 mt-1">
          Subí un documento y generá automáticamente el escrito judicial completado
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              paso === PASOS.SUBIR ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px]">1</span>
              Subir
            </div>
            <div className="w-8 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              ['analizar', 'plantilla', 'generar', 'resultado'].includes(paso) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px]">2</span>
              Analizar
            </div>
            <div className="w-8 h-0.5 bg-slate-300" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              ['plantilla', 'generar', 'resultado'].includes(paso) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              <span className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-[10px]">3</span>
              Generar
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {paso === PASOS.SUBIR && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-slate-700 font-medium mb-1">
                    {archivo ? archivo.name : 'Arrastrá el archivo o hacé click para seleccionar'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    PDF, Word (.docx) o texto (.txt) - Máximo 10MB
                  </p>
                </label>
              </div>

              {archivo && (
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{archivo.name}</p>
                      <p className="text-xs text-slate-500">{(archivo.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setArchivo(null)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              <button
                onClick={analizarDocumento}
                disabled={!archivo || loading}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analizando documento...
                  </>
                ) : (
                  <>
                    Analizar con IA
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}

          {(paso === PASOS.PLANTILLA || paso === PASOS.GENERAR) && analisis && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Documento analizado correctamente
                </h3>
                <p className="text-sm text-green-700">
                  Procesado en {analisis.processingTime}ms
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                  <h3 className="font-medium text-slate-800">Datos Extraídos</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Escrito</label>
                      <input
                        type="text"
                        value={datosEditables?.tipoEscritura || ''}
                        onChange={(e) => handleDatosChange('tipoEscritura', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Fuero</label>
                      <input
                        type="text"
                        value={datosEditables?.fuero || ''}
                        onChange={(e) => handleDatosChange('fuero', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Expediente</label>
                    <input
                      type="text"
                      value={datosEditables?.expediente || ''}
                      onChange={(e) => handleDatosChange('expediente', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Carátula</label>
                    <input
                      type="text"
                      value={datosEditables?.caratula || ''}
                      onChange={(e) => handleDatosChange('caratula', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Actor</label>
                      <input
                        type="text"
                        value={datosEditables?.partes?.actor || ''}
                        onChange={(e) => handlePartesChange('actor', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Demandado</label>
                      <input
                        type="text"
                        value={datosEditables?.partes?.demandado || ''}
                        onChange={(e) => handlePartesChange('demandado', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccioná la plantilla
                </label>
                <select
                  value={plantillaSeleccionada || ''}
                  onChange={(e) => setPlantillaSeleccionada(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Seleccionar plantilla...</option>
                  {plantillas.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.titulo} ({p.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">Usar IA para mejorar el texto</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reiniciar}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={generarEscrito}
                  disabled={!plantillaSeleccionada || loading}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generando...
                    </>
                  ) : (
                    'Generar Escrito'
                  )}
                </button>
              </div>
            </div>
          )}

          {paso === PASOS.RESULTADO && resultado && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Escrito generado exitosamente
                </h3>
                {resultado.completitud && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-green-700 mb-1">
                      <span>Variables completadas</span>
                      <span>{resultado.completitud.percentage}%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${resultado.completitud.percentage}%` }}
                      />
                    </div>
                    {resultado.completitud.pending.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Pendientes: {resultado.completitud.pending.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">Escrito Generado</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copiarAlPortapapeles}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Copiar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={descargarTexto}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Descargar TXT"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={descargarPDF}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Descargar PDF"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                    {resultado.escritoGenerado}
                  </pre>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Revisar cuidadosamente el escrito generado antes de استخدامه. 
                  Completá los campos pendientes y ajustá el contenido según sea necesario.
                </p>
              </div>

              <button
                onClick={reiniciar}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Generar Nuevo Escrito
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
