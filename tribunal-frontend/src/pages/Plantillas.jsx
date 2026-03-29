import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const CATEGORIAS = [
  { value: 'todas', label: 'Todas las categorías' },
  { value: 'escrito', label: 'Escrito' },
  { value: 'petitorio', label: 'Petitorio' },
  { value: 'recurso', label: 'Recurso' },
  { value: 'resolucion', label: 'Resolución' },
  { value: 'certificado', label: 'Certificado' },
  { value: 'demanda', label: 'Demanda' },
  { value: 'contestacion', label: 'Contestación' },
  { value: 'oficio', label: 'Oficio' },
  { value: 'nota', label: 'Nota' },
  { value: 'otro', label: 'Otro' },
];

const ORDENAR = [
  { value: 'modificacion', label: 'Última modificación' },
  { value: 'creacion', label: 'Fecha de creación' },
  { value: 'nombre', label: 'Nombre (A-Z)' },
  { value: 'nombreDesc', label: 'Nombre (Z-A)' },
  { value: 'variables', label: 'Cantidad de variables' },
  { value: 'usos', label: 'Más usadas' },
];

const categoriaColores = {
  escrito: 'bg-blue-100 text-blue-700',
  petitorio: 'bg-green-100 text-green-700',
  recurso: 'bg-orange-100 text-orange-700',
  resolucion: 'bg-purple-100 text-purple-700',
  certificado: 'bg-teal-100 text-teal-700',
  demanda: 'bg-red-100 text-red-700',
  contestacion: 'bg-pink-100 text-pink-700',
  oficio: 'bg-yellow-100 text-yellow-700',
  nota: 'bg-gray-100 text-gray-700',
  otro: 'bg-slate-100 text-slate-700',
};

function detectVariables(content) {
  const regex = /\{\{([^}]+)\}\}/g;
  const vars = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    vars.add(match[1].trim());
  }
  return Array.from(vars);
}

function ModalUsarPlantilla({ plantilla, onClose, onUsar }) {
  const [variables, setVariables] = useState({});
  const [preview, setPreview] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plantilla?.variables) {
      const vars = {};
      plantilla.variables.forEach(v => {
        vars[v.nombre || v] = '';
      });
      setVariables(vars);
    }
  }, [plantilla]);

  useEffect(() => {
    if (plantilla?.contenido) {
      let texto = plantilla.contenido;
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        texto = texto.replace(regex, value || `[${key}]`);
      });
      setPreview(texto);
    }
  }, [variables, plantilla]);

  const variablesFaltantes = useMemo(() => {
    return (plantilla?.variables || []).filter(v => {
      const nombre = v.nombre || v;
      return v.requerido !== false && !variables[nombre];
    });
  }, [variables, plantilla]);

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(preview);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleGenerar = async () => {
    if (variablesFaltantes.length > 0) {
      alert('Completá todas las variables requeridas');
      return;
    }
    setLoading(true);
    try {
      await api.plantillas.usar(plantilla._id);
      if (onUsar) onUsar(plantilla._id);
      onClose();
    } catch (error) {
      console.error('Error al usar plantilla:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!plantilla) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{plantilla.titulo}</h2>
            <span className={`text-xs px-2 py-1 rounded ${categoriaColores[plantilla.categoria] || categoriaColores.otro}`}>
              {plantilla.categoria}
            </span>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Completar Variables
                {variablesFaltantes.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {variablesFaltantes.length} faltantes
                  </span>
                )}
              </h3>
              <div className="space-y-3 max-h-[50vh] overflow-auto">
                {(plantilla.variables || []).map((v, i) => {
                  const nombre = v.nombre || v;
                  const esRequerido = v.requerido !== false;
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${!variables[nombre] && esRequerido ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {nombre}
                        {esRequerido && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {v.descripcion && <p className="text-xs text-gray-500 mb-2">{v.descripcion}</p>}
                      <input
                        type={v.tipo === 'fecha' ? 'date' : v.tipo === 'numero' ? 'number' : 'text'}
                        value={variables[nombre] || ''}
                        onChange={(e) => setVariables({ ...variables, [nombre]: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Ingresá ${nombre}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa
              </h3>
              <textarea
                readOnly
                value={preview}
                className="w-full h-[50vh] border border-gray-200 rounded-lg p-4 font-mono text-sm bg-gray-50 resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="border-t px-6 py-4 flex justify-between items-center bg-gray-50">
          <button onClick={handleCopiar} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            {copiado ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-600">Copiado</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copiar texto</span>
              </>
            )}
          </button>
          <button
            onClick={handleGenerar}
            disabled={loading || variablesFaltantes.length > 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Generar Documento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalCrearEditar({ plantilla, onClose, onSave }) {
  const [formData, setFormData] = useState({
    titulo: plantilla?.titulo || '',
    categoria: plantilla?.categoria || 'escrito',
    contenido: plantilla?.contenido || '',
    fuero: plantilla?.fuero || 'general',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const variablesDetectadas = useMemo(() => {
    return detectVariables(formData.contenido);
  }, [formData.contenido]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim() || !formData.contenido.trim()) {
      setError('El título y contenido son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = {
        ...formData,
        variables: variablesDetectadas.map(nombre => ({ nombre, tipo: 'texto', requerido: true })),
      };
      await onSave(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            {plantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h2>
          <button onClick={onClose} className="text-white hover:text-green-200 text-2xl">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                placeholder="Contestación de demanda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIAS.filter(c => c.value !== 'todas').map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuero</label>
              <select
                value={formData.fuero}
                onChange={(e) => setFormData({ ...formData, fuero: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="general">General</option>
                <option value="civil">Civil</option>
                <option value="penal">Penal</option>
                <option value="laboral">Laboral</option>
                <option value="familia">Familia</option>
                <option value="comercial">Comercial</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variables detectadas</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {variablesDetectadas.length === 0 ? (
                  <span className="text-gray-400 text-sm">Sin variables</span>
                ) : (
                  variablesDetectadas.map((v, i) => (
                    <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                      {`{{${v}}}`}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
            <textarea
              required
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-green-500"
              rows="12"
              placeholder={`Escribí tu plantilla.\nUsá {{nombreVariable}} para las variables editables.\n\nEjemplo:\nSr. Juez:\n{{nombre_actor}}, DNI {{dni}}, domiciliado en {{domicilio}}, me presento ante V.S. para...\n\n{{cuerpo_del_escrito}}`}
            />
          </div>
        </form>
        
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {plantilla ? 'Guardar Cambios' : 'Crear Plantilla'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlantillaCard({ plantilla, onUsar, onEditar, onDuplicar, onEliminar }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const fechaModificacion = new Date(plantilla.updatedAt).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-1">{plantilla.titulo}</h3>
          <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${categoriaColores[plantilla.categoria] || categoriaColores.otro}`}>
            {plantilla.categoria}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
              <button onClick={() => { onEditar(plantilla); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                ✏️ Editar
              </button>
              <button onClick={() => { onDuplicar(plantilla._id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                📋 Duplicar
              </button>
              <button onClick={() => { onEliminar(plantilla._id); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600">
                🗑️ Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {plantilla.contenido?.substring(0, 120)}...
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {plantilla.variables?.length || 0} variables
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {fechaModificacion}
        </span>
        {plantilla.usageCount > 0 && (
          <span className="flex items-center gap-1 text-blue-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {plantilla.usageCount} usos
          </span>
        )}
      </div>
      
      <button
        onClick={() => onUsar(plantilla)}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Usar Plantilla
      </button>
    </div>
  );
}

function SeccionPlantillas({ titulo, plantillas, onUsar, onEditar, onDuplicar, onEliminar, verTodas }) {
  if (!plantillas || plantillas.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{titulo}</h3>
        {verTodas && <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Ver todas →</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {plantillas.slice(0, 4).map(p => (
          <PlantillaCard key={p._id} plantilla={p} onUsar={onUsar} onEditar={onEditar} onDuplicar={onDuplicar} onEliminar={onEliminar} />
        ))}
      </div>
    </div>
  );
}

export default function Plantillas() {
  const { plantillas, refreshPlantillas, loading } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [ordenar, setOrdenar] = useState('modificacion');
  const [plantillasFiltradas, setPlantillasFiltradas] = useState([]);
  const [plantillasRecientes, setPlantillasRecientes] = useState([]);
  const [plantillasPopulares, setPlantillasPopulares] = useState([]);
  
  const [modalUsar, setModalUsar] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [editandoPlantilla, setEditandoPlantilla] = useState(null);
  
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    filtrarPlantillas();
  }, [busqueda, categoria, ordenar, plantillas]);

  const cargarDatos = async () => {
    try {
      const [recientes, populares] = await Promise.all([
        api.plantillas.getRecientes(),
        api.plantillas.getPopulares()
      ]);
      if (recientes.success) setPlantillasRecientes(recientes.data);
      if (populares.success) setPlantillasPopulares(populares.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const filtrarPlantillas = async () => {
    try {
      const filtros = {};
      if (busqueda) filtros.busqueda = busqueda;
      if (categoria !== 'todas') filtros.categoria = categoria;
      if (ordenar) filtros.ordenar = ordenar;
      
      const res = await api.plantillas.getAll(filtros);
      if (res.success) {
        setPlantillasFiltradas(res.data);
      }
    } catch (error) {
      console.error('Error filtrando:', error);
    }
  };

  const handleUsar = (plantilla) => {
    setModalUsar(plantilla);
  };

  const handleEditar = (plantilla) => {
    setEditandoPlantilla(plantilla);
    setModalCrear(true);
  };

  const handleDuplicar = async (id) => {
    setLoadingAccion(true);
    try {
      await api.plantillas.duplicar(id);
      setMensaje('Plantilla duplicada correctamente');
      refreshPlantillas();
      cargarDatos();
    } catch (error) {
      setMensaje('Error al duplicar');
    }
    setLoadingAccion(false);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla?')) return;
    setLoadingAccion(true);
    try {
      await api.plantillas.delete(id);
      setMensaje('Plantilla eliminada');
      refreshPlantillas();
      cargarDatos();
    } catch (error) {
      setMensaje('Error al eliminar');
    }
    setLoadingAccion(false);
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleGuardarPlantilla = async (data) => {
    if (editandoPlantilla) {
      await api.plantillas.update(editandoPlantilla._id, data);
      setMensaje('Plantilla actualizada');
    } else {
      await api.plantillas.create(data);
      setMensaje('Plantilla creada');
    }
    refreshPlantillas();
    cargarDatos();
    setEditandoPlantilla(null);
    setTimeout(() => setMensaje(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {mensaje && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {mensaje}
        </div>
      )}

      <ModalUsarPlantilla 
        plantilla={modalUsar} 
        onClose={() => setModalUsar(null)} 
        onUsar={cargarDatos}
      />
      
      {modalCrear && (
        <ModalCrearEditar
          plantilla={editandoPlantilla}
          onClose={() => { setModalCrear(false); setEditandoPlantilla(null); }}
          onSave={handleGuardarPlantilla}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Biblioteca de Plantillas</h1>
        <p className="text-gray-500">Gestiona y utiliza tus modelos de escritos judiciales</p>
      </div>

      <SeccionPlantillas 
        titulo="⭐ Destacadas" 
        plantillas={plantillasPopulares} 
        onUsar={handleUsar}
        onEditar={handleEditar}
        onDuplicar={handleDuplicar}
        onEliminar={handleEliminar}
      />

      <SeccionPlantillas 
        titulo="🕐 Usadas recientemente" 
        plantillas={plantillasRecientes} 
        onUsar={handleUsar}
        onEditar={handleEditar}
        onDuplicar={handleDuplicar}
        onEliminar={handleEliminar}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
            >
              {ORDENAR.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            
            <button
              onClick={() => { setEditandoPlantilla(null); setModalCrear(true); }}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva
            </button>
          </div>
        </div>

        {plantillasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No se encontraron plantillas</h3>
            <p className="text-gray-400 mb-4">Creá tu primera plantilla para comenzar</p>
            <button
              onClick={() => { setEditandoPlantilla(null); setModalCrear(true); }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700"
            >
              Crear Plantilla
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{plantillasFiltradas.length} plantilla{plantillasFiltradas.length !== 1 ? 's' : ''} encontrada{plantillasFiltradas.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {plantillasFiltradas.map(p => (
                <PlantillaCard 
                  key={p._id} 
                  plantilla={p} 
                  onUsar={handleUsar}
                  onEditar={handleEditar}
                  onDuplicar={handleDuplicar}
                  onEliminar={handleEliminar}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
