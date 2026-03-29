import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { jsPDF } from 'jspdf';

const PASOS = {
  SUBIR: 'subir',
  ANALIZAR: 'analizar',
  SELECCIONAR: 'seleccionar',
  COMPLETAR: 'completar',
  GENERAR: 'generar',
  RESULTADO: 'resultado'
};

const CATALOGO_VARIABLES = {
  expediente: { label: 'Expediente', type: 'text', category: 'proceso', nivel: 'critico' },
  caratula: { label: 'Carátula', type: 'text', category: 'proceso', nivel: 'critico' },
  juzgado: { label: 'Juzgado', type: 'text', category: 'proceso', nivel: 'critico' },
  ciudad: { label: 'Ciudad', type: 'text', category: 'proceso', nivel: 'critico' },
  fuero: { label: 'Fuero', type: 'text', category: 'proceso', nivel: 'opcional' },
  
  actor: { label: 'Actor/Demandante', type: 'text', category: 'partes', nivel: 'critico' },
  demandado: { label: 'Demandado', type: 'text', category: 'partes', nivel: 'critico' },
  dni_actor: { label: 'DNI Actor', type: 'text', category: 'partes', nivel: 'recomendado' },
  dni_demandado: { label: 'DNI Demandado', type: 'text', category: 'partes', nivel: 'recomendado' },
  CUIT_actor: { label: 'CUIT Actor', type: 'text', category: 'partes', nivel: 'opcional' },
  CUIT_demandado: { label: 'CUIT Demandado', type: 'text', category: 'partes', nivel: 'opcional' },
  
  abogado_actor: { label: 'Abogado Actor', type: 'text', category: 'abogados', nivel: 'recomendado' },
  abogado_demandado: { label: 'Abogado Demandado', type: 'text', category: 'abogados', nivel: 'recomendado' },
  matricula_actor: { label: 'Matrícula Actor', type: 'text', category: 'abogados', nivel: 'recomendado' },
  matricula_demandado: { label: 'Matrícula Demandado', type: 'text', category: 'abogados', nivel: 'recomendado' },
  
  domicilio_actor: { label: 'Domicilio Actor', type: 'text', category: 'domicilios', nivel: 'critico' },
  domicilio_demandado: { label: 'Domicilio Demandado', type: 'text', category: 'domicilios', nivel: 'recomendado' },
  
  fecha_presentacion: { label: 'Fecha Presentación', type: 'date', category: 'fechas', nivel: 'recomendado' },
  fecha_sentencia: { label: 'Fecha Sentencia', type: 'date', category: 'fechas', nivel: 'recomendado' },
  fecha_contrato: { label: 'Fecha Contrato', type: 'date', category: 'fechas', nivel: 'recomendado' },
  
  objeto_procesal: { label: 'Objeto Procesal', type: 'textarea', category: 'proceso', nivel: 'critico' },
  tipo_accion: { label: 'Tipo de Acción', type: 'text', category: 'proceso', nivel: 'recomendado' },
  monto: { label: 'Monto', type: 'currency', category: 'proceso', nivel: 'recomendado' },
  
  testigo_1: { label: 'Testigo 1', type: 'text', category: 'testigos', nivel: 'opcional' },
  testigo_2: { label: 'Testigo 2', type: 'text', category: 'testigos', nivel: 'opcional' },
  testigo_3: { label: 'Testigo 3', type: 'text', category: 'testigos', nivel: 'opcional' },
  
  perito: { label: 'Perito', type: 'text', category: 'otros', nivel: 'opcional' },
  juez: { label: 'Juez', type: 'text', category: 'otros', nivel: 'opcional' },
  fojas: { label: 'Fojas', type: 'number', category: 'otros', nivel: 'opcional' },
};

const NIVEL_LABELS = {
  critico: { label: 'Crítico', color: 'red', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  recomendado: { label: 'Recomendado', color: 'amber', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  opcional: { label: 'Opcional', color: 'slate', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' }
};

function detectarVariables(contenido) {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables = new Set();
  let match;
  while ((match = regex.exec(contenido)) !== null) {
    variables.add(match[1].trim());
  }
  return Array.from(variables);
}

function inicializarDatosConAnalisis(analisis) {
  const datos = {};
  
  if (analisis) {
    datos.expediente = analisis.expediente || '';
    datos.caratula = analisis.caratula || '';
    datos.juzgado = analisis.juzgado || '';
    datos.fuero = analisis.fuero || '';
    datos.tipo_accion = analisis.tipoEscritura || '';
    datos.objeto_procesal = analisis.objetoProcesal || '';
    
    if (analisis.partes) {
      datos.actor = analisis.partes.actor || '';
      datos.demandado = analisis.partes.demandado || '';
      datos.abogado_actor = analisis.partes.abogadoActor || '';
      datos.abogado_demandado = analisis.partes.abogadoDemandado || '';
    }
    
    if (analisis.domicilios) {
      datos.domicilio_actor = analisis.domicilios.actor || '';
      datos.domicilio_demandado = analisis.domicilios.demandado || '';
    }
    
    if (analisis.fechas) {
      datos.fecha_presentacion = analisis.fechas.presentacion || '';
      datos.fecha_sentencia = analisis.fechas.sentencia || '';
    }
  }
  
  return datos;
}

function PasoSubir({ archivo, setArchivo, onAnalizar, loading, error, setError }) {
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

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={onAnalizar}
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
  );
}

function PasoAnalizar({ analisis, processingTime, onContinuar }) {
  const datosExtraidos = analisis?.datosExtraidos || {};
  
  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Documento analizado correctamente
        </h3>
        <p className="text-sm text-green-700">
          Procesado en {processingTime}ms
        </p>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">Datos Extraídos</h3>
          <p className="text-xs text-slate-500">Datos que la IA logró identificar del documento</p>
        </div>
        <div className="p-4 space-y-3">
          {Object.keys(datosExtraidos).length === 0 ? (
            <p className="text-slate-500 text-sm">No se pudieron extraer datos automáticos</p>
          ) : (
            <>
              {(datosExtraidos.tipoEscritura || datosExtraidos.fuero || datosExtraidos.expediente || datosExtraidos.caratula) && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Datos del Proceso</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {datosExtraidos.tipoEscritura && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Tipo:</span>
                        <p className="text-sm font-medium">{datosExtraidos.tipoEscritura}</p>
                      </div>
                    )}
                    {datosExtraidos.fuero && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Fuero:</span>
                        <p className="text-sm font-medium">{datosExtraidos.fuero}</p>
                      </div>
                    )}
                    {datosExtraidos.expediente && (
                      <div className="bg-slate-50 p-2 rounded col-span-2">
                        <span className="text-xs text-slate-500">Expediente:</span>
                        <p className="text-sm font-medium font-mono">{datosExtraidos.expediente}</p>
                      </div>
                    )}
                    {datosExtraidos.caratula && (
                      <div className="bg-slate-50 p-2 rounded col-span-2">
                        <span className="text-xs text-slate-500">Carátula:</span>
                        <p className="text-sm font-medium">{datosExtraidos.caratula}</p>
                      </div>
                    )}
                    {datosExtraidos.juzgado && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Juzgado:</span>
                        <p className="text-sm font-medium">{datosExtraidos.juzgado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {datosExtraidos.partes && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 uppercase mb-2">Partes</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {datosExtraidos.partes.actor && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Actor:</span>
                        <p className="text-sm font-medium">{datosExtraidos.partes.actor}</p>
                      </div>
                    )}
                    {datosExtraidos.partes.demandado && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Demandado:</span>
                        <p className="text-sm font-medium">{datosExtraidos.partes.demandado}</p>
                      </div>
                    )}
                    {datosExtraidos.partes.abogadoActor && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Abogado Actor:</span>
                        <p className="text-sm font-medium">{datosExtraidos.partes.abogadoActor}</p>
                      </div>
                    )}
                    {datosExtraidos.partes.abogadoDemandado && (
                      <div className="bg-slate-50 p-2 rounded">
                        <span className="text-xs text-slate-500">Abogado Demandado:</span>
                        <p className="text-sm font-medium">{datosExtraidos.partes.abogadoDemandado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Nota:</strong> Los datos extraídos son un punto de partida. 
          En el siguiente paso podrás completar o corregir toda la información 
          antes de generar el escrito.
        </p>
      </div>

      <button
        onClick={onContinuar}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
      >
        Continuar
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    </div>
  );
}

function PasoSeleccionar({ plantillas, plantillaSeleccionada, setPlantillaSeleccionada, onContinuar, onVolver }) {
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  
  const categorias = useMemo(() => {
    const cats = new Set(plantillas.map(p => p.categoria));
    return ['todas', ...Array.from(cats)];
  }, [plantillas]);
  
  const plantillasFiltradas = useMemo(() => {
    if (filtroCategoria === 'todas') return plantillas;
    return plantillas.filter(p => p.categoria === filtroCategoria);
  }, [plantillas, filtroCategoria]);
  
  const categoriaBadge = {
    escrito: 'bg-blue-100 text-blue-700',
    petitorio: 'bg-green-100 text-green-700',
    recurso: 'bg-orange-100 text-orange-700',
    resolucion: 'bg-purple-100 text-purple-700',
    demanda: 'bg-red-100 text-red-700',
    contestacion: 'bg-pink-100 text-pink-700',
    oficio: 'bg-yellow-100 text-yellow-700',
    nota: 'bg-gray-100 text-gray-700',
    otro: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-slate-800 mb-3">Seleccioná una Plantilla</h3>
        
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-4"
        >
          {categorias.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'todas' ? 'Todas las categorías' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {plantillasFiltradas.map(p => {
            const variables = detectarVariables(p.contenido);
            const selected = plantillaSeleccionada === p._id;
            return (
              <div
                key={p._id}
                onClick={() => setPlantillaSeleccionada(p._id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{p.titulo}</h4>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded mt-1 ${categoriaBadge[p.categoria] || categoriaBadge.otro}`}>
                      {p.categoria}
                    </span>
                  </div>
                  {selected && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {variables.length} variable{variables.length !== 1 ? 's' : ''} • {p.fuero || 'General'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onVolver}
          className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
        >
          Volver
        </button>
        <button
          onClick={onContinuar}
          disabled={!plantillaSeleccionada}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

function PasoCompletar({ plantilla, datosCompletados, setDatosCompletados, onGenerar, onVolver, loading }) {
  const variables = useMemo(() => {
    return detectarVariables(plantilla?.contenido || '');
  }, [plantilla]);
  
  const variablesInfo = useMemo(() => {
    return variables.map(varName => {
      const info = CATALOGO_VARIABLES[varName] || { 
        label: varName, 
        type: 'text', 
        category: 'otros',
        nivel: 'opcional' 
      };
      const value = datosCompletados[varName] || '';
      const tieneValor = value && value.trim() !== '';
      return { name: varName, ...info, value, tieneValor };
    });
  }, [variables, datosCompletados]);
  
  const criticos = variablesInfo.filter(v => v.nivel === 'critico');
  const recomendados = variablesInfo.filter(v => v.nivel === 'recomendado');
  const opcionales = variablesInfo.filter(v => v.nivel === 'opcional');
  const completas = variablesInfo.filter(v => v.tieneValor);
  const faltantesCriticos = criticos.filter(v => !v.tieneValor);
  const faltantesRecomendados = recomendados.filter(v => !v.tieneValor);
  
  const handleChange = (name, value) => {
    setDatosCompletados(prev => ({ ...prev, [name]: value }));
  };
  
  const progress = variablesInfo.length > 0 
    ? Math.round((completas.length / variablesInfo.length) * 100) 
    : 0;
  
  const puedeGenerar = faltantesCriticos.length === 0;
  const esBorrador = faltantesCriticos.length === 0 && faltantesRecomendados.length > 0;
  const estado = faltantesCriticos.length > 0 ? 'incompleto' : esBorrador ? 'borrador' : 'completo';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-800">{plantilla?.titulo}</h3>
          <span className="text-sm font-medium text-slate-600">{progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${puedeGenerar ? 'bg-green-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {completas.length} de {variablesInfo.length} variables completadas
          {estado === 'incompleto' && (
            <span className="text-red-600"> • Faltan {faltantesCriticos.length} críticos</span>
          )}
          {estado === 'borrador' && (
            <span className="text-amber-600"> • Faltan {faltantesRecomendados.length} recomendados</span>
          )}
        </p>
      </div>

      {estado === 'incompleto' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Datos críticos requeridos
          </h4>
          <p className="text-sm text-red-700">
            Para generar el escrito necesitás completar: {faltantesCriticos.map(f => f.label).join(', ')}
          </p>
        </div>
      )}

      {estado === 'borrador' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Modo borrador
          </h4>
          <p className="text-sm text-amber-700">
            Podés generar el escrito en modo borrador. Los siguientes datos recomendados faltan: {faltantesRecomendados.map(f => f.label).join(', ')}
          </p>
        </div>
      )}

      <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
        {criticos.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Datos Críticos <span className="text-red-600 text-xs">(requeridos)</span>
            </h4>
            <div className="space-y-3">
              {criticos.map(v => (
                <div key={v.name} className={`p-3 rounded-lg border ${v.tieneValor ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {v.label} <span className="text-red-500">*</span>
                  </label>
                  {v.type === 'textarea' ? (
                    <textarea
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows={3}
                      placeholder={`Ingresá ${v.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={v.type === 'date' ? 'date' : v.type === 'number' ? 'number' : 'text'}
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder={`Ingresá ${v.label.toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {recomendados.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Datos Recomendados <span className="text-amber-600 text-xs">(para mejor resultado)</span>
            </h4>
            <div className="space-y-3">
              {recomendados.map(v => (
                <div key={v.name} className={`p-3 rounded-lg border ${v.tieneValor ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {v.label}
                  </label>
                  {v.type === 'textarea' ? (
                    <textarea
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows={2}
                      placeholder={`Ingresá ${v.label.toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={v.type === 'date' ? 'date' : v.type === 'number' ? 'number' : 'text'}
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder={`Ingresá ${v.label.toLowerCase()} (opcional)`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {opcionales.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
              Datos Opcionales
            </h4>
            <div className="space-y-3">
              {opcionales.map(v => (
                <div key={v.name} className="p-3 rounded-lg border border-slate-200 bg-white">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {v.label}
                  </label>
                  {v.type === 'textarea' ? (
                    <textarea
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      rows={2}
                      placeholder={`Ingresá ${v.label.toLowerCase()} (opcional)`}
                    />
                  ) : (
                    <input
                      type={v.type === 'date' ? 'date' : v.type === 'number' ? 'number' : 'text'}
                      value={v.value}
                      onChange={(e) => handleChange(v.name, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      placeholder={`Ingresá ${v.label.toLowerCase()} (opcional)`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onVolver}
          className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
        >
          Volver
        </button>
        <button
          onClick={onGenerar}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
            loading 
              ? 'bg-slate-300 text-white cursor-not-allowed'
              : puedeGenerar 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generando...
            </>
          ) : puedeGenerar ? (
            <>
              Generar Escrito Completo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </>
          ) : (
            <>
              Generar Borrador
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PasoResultado({ resultado, onCopiar, onDescargarTexto, onDescargarPDF, onNuevo }) {
  const [copiado, setCopiado] = useState(false);
  
  const handleCopiar = () => {
    onCopiar();
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };
  
  return (
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
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-medium text-slate-800">Written Generated</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopiar}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-sm"
            >
              {copiado ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copiado
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={onDescargarTexto}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              title="Descargar TXT"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={onDescargarPDF}
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

      <button
        onClick={onNuevo}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Generar Nuevo Escrito
      </button>
    </div>
  );
}

function IndicadorPasos({ pasoActual }) {
  const pasos = [
    { key: PASOS.SUBIR, label: 'Subir', numero: 1 },
    { key: PASOS.ANALIZAR, label: 'Analizar', numero: 2 },
    { key: PASOS.SELECCIONAR, label: 'Plantilla', numero: 3 },
    { key: PASOS.COMPLETAR, label: 'Completar', numero: 4 },
    { key: PASOS.RESULTADO, label: 'Resultado', numero: 5 },
  ];
  
  const pasoIndex = pasos.findIndex(p => p.key === pasoActual);
  
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {pasos.map((p, i) => {
        const isActive = i === pasoIndex;
        const isCompleted = i < pasoIndex;
        
        return (
          <div key={p.key} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
              isActive 
                ? 'bg-blue-600 text-white' 
                : isCompleted 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-200 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isActive ? 'bg-white text-blue-600' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-300'
              }`}>
                {isCompleted ? '✓' : p.numero}
              </span>
              {p.label}
            </div>
            {i < pasos.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 ${isCompleted ? 'bg-green-300' : 'bg-slate-300'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GeneradorIA() {
  const [paso, setPaso] = useState(PASOS.SUBIR);
  const [archivo, setArchivo] = useState(null);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [plantillaData, setPlantillaData] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [datosCompletados, setDatosCompletados] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const puedeGenerar = useMemo(() => {
    if (!plantillaData?.contenido) return false;
    const vars = detectarVariables(plantillaData.contenido);
    const criticos = vars.filter(v => (CATALOGO_VARIABLES[v]?.nivel) === 'critico');
    return criticos.every(v => datosCompletados[v]?.trim());
  }, [plantillaData, datosCompletados]);

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

  const analizarDocumento = async () => {
    if (!archivo) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.generar.analizar(archivo);
      
      if (res.success) {
        setAnalisis(res.data);
        const datosIniciales = inicializarDatosConAnalisis(res.data.datosExtraidos);
        setDatosCompletados(datosIniciales);
        setPaso(PASOS.ANALIZAR);
      } else {
        setError(res.error || 'Error al analizar documento');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar el documento');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPlantilla = () => {
    const plant = plantillas.find(p => p._id === plantillaSeleccionada);
    setPlantillaData(plant);
    setPaso(PASOS.COMPLETAR);
  };

  const generarEscrito = async () => {
    if (!plantillaSeleccionada) return;
    
    setLoading(true);
    setError(null);
    
    const forzarBorrador = !puedeGenerar;
    
    try {
      const res = await api.generar.generarDirecto(datosCompletados, plantillaSeleccionada, true, forzarBorrador);
      
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

  const copiarAlPortapapeles = () => {
    if (resultado?.escritoGenerado) {
      navigator.clipboard.writeText(resultado.escritoGenerado);
    }
  };

  const descargarTexto = () => {
    if (resultado?.escritoGenerado) {
      const blob = new Blob([resultado.escritoGenerado], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `escrito_${Date.now()}.txt`;
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
    setPlantillaSeleccionada(null);
    setPlantillaData(null);
    setAnalisis(null);
    setDatosCompletados({});
    setResultado(null);
    setError(null);
  };

  const irAPaso = (nuevoPaso) => {
    setPaso(nuevoPaso);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Generador de Escritos con IA</h1>
        <p className="text-slate-600 mt-1">
          Generá escritos judiciales completos en pocos pasos
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <IndicadorPasos pasoActual={paso} />
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {paso === PASOS.SUBIR && (
            <PasoSubir
              archivo={archivo}
              setArchivo={setArchivo}
              onAnalizar={analizarDocumento}
              loading={loading}
              error={error}
              setError={setError}
            />
          )}

          {paso === PASOS.ANALIZAR && (
            <PasoAnalizar
              analisis={analisis}
              processingTime={analisis?.processingTime || 0}
              onContinuar={() => irAPaso(PASOS.SELECCIONAR)}
            />
          )}

          {paso === PASOS.SELECCIONAR && (
            <PasoSeleccionar
              plantillas={plantillas}
              plantillaSeleccionada={plantillaSeleccionada}
              setPlantillaSeleccionada={setPlantillaSeleccionada}
              onContinuar={seleccionarPlantilla}
              onVolver={() => irAPaso(PASOS.ANALIZAR)}
            />
          )}

          {paso === PASOS.COMPLETAR && (
            <PasoCompletar
              plantilla={plantillaData}
              datosCompletados={datosCompletados}
              setDatosCompletados={setDatosCompletados}
              onGenerar={generarEscrito}
              onVolver={() => irAPaso(PASOS.SELECCIONAR)}
              loading={loading}
            />
          )}

          {paso === PASOS.RESULTADO && (
            <PasoResultado
              resultado={resultado}
              onCopiar={copiarAlPortapapeles}
              onDescargarTexto={descargarTexto}
              onDescargarPDF={descargarPDF}
              onNuevo={reiniciar}
            />
          )}
        </div>
      </div>
    </div>
  );
}
