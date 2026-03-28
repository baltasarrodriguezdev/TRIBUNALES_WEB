import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const jurisdicciones = ['Civil', 'Penal', 'Laboral', 'Comercial', 'Familia', 'Contencioso Administrativo', 'Otro'];

const estadoBadge = {
  activo: 'badge-success',
  archivado: 'badge-neutral',
  pausado: 'badge-warning',
};

export default function Expedientes() {
  const { expedientes, refreshExpedientes, loading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    caratula: '',
    estado: 'activo',
    jurisdiccion: 'Civil',
    fuero: '',
    observaciones: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.expedientes.create(formData);
    setFormData({ numero: '', caratula: '', estado: 'activo', jurisdiccion: 'Civil', fuero: '', observaciones: '' });
    setShowForm(false);
    refreshExpedientes();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este expediente?')) {
      await api.expedientes.delete(id);
      refreshExpedientes();
    }
  };

  const handleToggleEstado = async (exp) => {
    const nuevoEstado = exp.estado === 'activo' ? 'archivado' : 'activo';
    await api.expedientes.update(exp._id, { ...exp, estado: nuevoEstado });
    refreshExpedientes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-slate-500 mt-1">{expedientes.length} registro{expedientes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Expediente
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Nuevo Expediente
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Número de Expediente *</label>
                  <input
                    type="text"
                    required
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    className="form-input"
                    placeholder="EXP-2026-00001"
                  />
                </div>
                <div>
                  <label className="form-label">Carátula *</label>
                  <input
                    type="text"
                    required
                    value={formData.caratula}
                    onChange={(e) => setFormData({ ...formData, caratula: e.target.value })}
                    className="form-input"
                    placeholder="Pérez Juan c/ García María"
                  />
                </div>
                <div>
                  <label className="form-label">Jurisdicción</label>
                  <select
                    value={formData.jurisdiccion}
                    onChange={(e) => setFormData({ ...formData, jurisdiccion: e.target.value })}
                    className="form-input"
                  >
                    {jurisdicciones.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Fuero / Juzgado</label>
                  <input
                    type="text"
                    value={formData.fuero}
                    onChange={(e) => setFormData({ ...formData, fuero: e.target.value })}
                    className="form-input"
                    placeholder="Juzgado N°5"
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="form-input"
                    rows="2"
                    placeholder="Notas adicionales sobre el expediente..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body p-0">
          {expedientes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-2">No hay expedientes registrados</p>
              <p className="text-sm text-slate-500">Haz clic en "Nuevo Expediente" para comenzar</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="px-4 py-3">Número</th>
                  <th className="px-4 py-3">Carátula</th>
                  <th className="px-4 py-3">Jurisdicción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expedientes.map((exp) => (
                  <tr key={exp._id}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-blue-600 font-medium">{exp.numero}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900">{exp.caratula}</span>
                      {exp.fuero && (
                        <span className="block text-xs text-slate-500">{exp.fuero}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge badge-info">{exp.jurisdiccion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${estadoBadge[exp.estado]}`}>
                        {exp.estado.charAt(0).toUpperCase() + exp.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleEstado(exp)}
                          className="action-btn"
                          title={exp.estado === 'activo' ? 'Archivar' : 'Activar'}
                        >
                          {exp.estado === 'activo' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="action-btn danger"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
