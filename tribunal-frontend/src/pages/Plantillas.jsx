import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export default function Plantillas() {
  const { plantillas, refreshPlantillas, loading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [selectedPlantilla, setSelectedPlantilla] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: 'escrito',
    contenido: '',
    variables: ''
  });
  const [variablesEditando, setVariablesEditando] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      variables: formData.variables.split(',').map(v => v.trim()).filter(v => v)
    };
    await api.plantillas.create(data);
    setFormData({ titulo: '', categoria: 'escrito', contenido: '', variables: '' });
    setShowForm(false);
    refreshPlantillas();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      await api.plantillas.delete(id);
      refreshPlantillas();
    }
  };

  const usarPlantilla = (plantilla) => {
    const vars = {};
    plantilla.variables.forEach(v => {
      vars[v] = '';
    });
    setVariablesEditando(vars);
    setSelectedPlantilla(plantilla);
  };

  const generarTexto = () => {
    let texto = selectedPlantilla.contenido;
    Object.entries(variablesEditando).forEach(([key, value]) => {
      texto = texto.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return texto;
  };

  const copiarTexto = () => {
    navigator.clipboard.writeText(generarTexto());
    alert('Texto copiado al portapapeles');
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Biblioteca de Plantillas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancelar' : '+ Nueva Plantilla'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Contestación de demanda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría</label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                <option value="escrito">Escrito</option>
                <option value="recurso">Recurso</option>
                <option value="petitorio">Petitorio</option>
                <option value="oficio">Oficio</option>
                <option value="nota">Nota</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Variables (separadas por coma)</label>
              <input
                type="text"
                value={formData.variables}
                onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="nombre, causa, demandado, Juzgado"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usá {'{{'}nombreVariable{'}}'} en el contenido
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Contenido</label>
              <textarea
                required
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                className="w-full border rounded px-3 py-2 font-mono text-sm"
                rows="10"
                placeholder={`Escribí tu plantilla acá. Usá {{variable}} para los campos editables.`}
              />
            </div>
          </div>
          <button type="submit" className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Guardar Plantilla
          </button>
        </form>
      )}

      {selectedPlantilla && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Usar: {selectedPlantilla.titulo}</h3>
            <button onClick={() => setSelectedPlantilla(null)} className="text-gray-500 hover:text-gray-700">
              ✕ Cerrar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium mb-2">Completar Variables</h4>
              {selectedPlantilla.variables.map((v) => (
                <div key={v} className="mb-2">
                  <label className="block text-sm font-medium mb-1">{v}</label>
                  <input
                    type="text"
                    value={variablesEditando[v] || ''}
                    onChange={(e) => setVariablesEditando({ ...variablesEditando, [v]: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Vista Previa</h4>
                <button onClick={copiarTexto} className="text-blue-500 hover:text-blue-700 text-sm">
                  📋 Copiar
                </button>
              </div>
              <textarea
                readOnly
                value={generarTexto()}
                className="w-full border rounded px-3 py-2 font-mono text-sm bg-gray-50"
                rows="12"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plantillas.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No hay plantillas. Creá tu primera plantilla.
          </div>
        ) : (
          plantillas.map((plantilla) => (
            <div key={plantilla._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{plantilla.titulo}</h3>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {plantilla.categoria}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3 truncate">
                {plantilla.contenido.substring(0, 100)}...
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {plantilla.variables.length} variables
                </span>
                <div>
                  <button
                    onClick={() => usarPlantilla(plantilla)}
                    className="text-blue-500 hover:text-blue-700 text-sm mr-3"
                  >
                    Usar
                  </button>
                  <button
                    onClick={() => handleDelete(plantilla._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
