import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { format, parseISO, isBefore, differenceInDays } from 'date-fns';

const prioridadBadge = {
  alta: 'badge-danger',
  media: 'badge-warning',
  baja: 'badge-neutral',
};

function getEstadoBadge(plazo) {
  const hoy = new Date();
  const fechaLimite = parseISO(plazo.fechaLimite);
  
  if (plazo.estado === 'cumplido') {
    return { label: 'Cumplido', class: 'badge-success' };
  }
  if (isBefore(fechaLimite, hoy)) {
    return { label: 'Vencido', class: 'badge-danger' };
  }
  if (differenceInDays(fechaLimite, hoy) <= 3) {
    return { label: 'Próximo', class: 'badge-warning' };
  }
  return { label: 'Pendiente', class: 'badge-info' };
}

export default function Plazos() {
  const { plazos, expedientes, refreshPlazos, loading } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    expedienteId: '',
    descripcion: '',
    fechaLimite: '',
    tipo: 'habil',
    prioridad: 'media',
    observaciones: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.plazos.create(formData);
    setFormData({ expedienteId: '', descripcion: '', fechaLimite: '', tipo: 'habil', prioridad: 'media', observaciones: '' });
    setShowForm(false);
    refreshPlazos();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este plazo?')) {
      await api.plazos.delete(id);
      refreshPlazos();
    }
  };

  const handleMarcarCumplido = async (plazo) => {
    await api.plazos.update(plazo._id, { ...plazo, estado: 'cumplido' });
    refreshPlazos();
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

  const activosExpedientes = expedientes.filter(e => e.estado === 'activo');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plazos Legales</h1>
          <p className="text-slate-500 mt-1">{plazos.length} registro{plazos.length !== 1 ? 's' : ''}</p>
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
              Nuevo Plazo
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="card-header flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Nuevo Plazo
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Expediente *</label>
                  <select
                    required
                    value={formData.expedienteId}
                    onChange={(e) => setFormData({ ...formData, expedienteId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Seleccionar expediente...</option>
                    {activosExpedientes.map(exp => (
                      <option key={exp._id} value={exp._id}>
                        {exp.numero} - {exp.caratula}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Descripción *</label>
                  <input
                    type="text"
                    required
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="form-input"
                    placeholder="Contestar demanda"
                  />
                </div>
                <div>
                  <label className="form-label">Fecha Límite *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaLimite}
                    onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="form-input"
                    >
                      <option value="habil">Hábiles</option>
                      <option value="corrido">Corridos</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Prioridad</label>
                    <select
                      value={formData.prioridad}
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                      className="form-input"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    className="form-input"
                    rows="2"
                    placeholder="Notas adicionales..."
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
          {plazos.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium mb-2">No hay plazos registrados</p>
              <p className="text-sm text-slate-500">Haz clic en "Nuevo Plazo" para comenzar</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Expediente</th>
                  <th className="px-4 py-3">Fecha Límite</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {plazos.map((plazo) => {
                  const exp = expedientes.find(e => e._id === plazo.expedienteId || e._id === plazo.expedienteId?._id);
                  const estado = getEstadoBadge(plazo);
                  return (
                    <tr key={plazo._id}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-900">{plazo.descripcion}</span>
                        {plazo.observaciones && (
                          <span className="block text-xs text-slate-500 truncate max-w-xs">{plazo.observaciones}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-blue-600">
                          {exp?.numero || plazo.expedienteId?.numero || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {format(parseISO(plazo.fechaLimite), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {plazo.tipo === 'habil' ? 'Hábiles' : 'Corridos'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${prioridadBadge[plazo.prioridad]}`}>
                          {plazo.prioridad.charAt(0).toUpperCase() + plazo.prioridad.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${estado.class}`}>{estado.label}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {plazo.estado !== 'cumplido' && (
                            <button
                              onClick={() => handleMarcarCumplido(plazo)}
                              className="action-btn"
                              title="Marcar como cumplido"
                            >
                              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(plazo._id)}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
