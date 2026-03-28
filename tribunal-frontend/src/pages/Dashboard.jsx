import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, isBefore } from 'date-fns';

function StatCard({ label, value, variant = 'default' }) {
  const config = {
    default: {
      bg: 'bg-white',
      border: 'border-slate-200',
      icon: 'bg-blue-100 text-blue-600',
      value: 'text-slate-900',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      value: 'text-red-600',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      value: 'text-amber-600',
    },
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      icon: 'bg-emerald-100 text-emerald-600',
      value: 'text-emerald-600',
    },
  };

  const c = config[variant] || config.default;
  const icons = {
    default: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    danger: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    warning: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  };

  return (
    <div className={`card ${c.bg} ${c.border} border-l-4 border-t-0 border-r-0 border-b-0 rounded-r-lg`}>
      <div className="card-body flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${c.value}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${c.icon}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icons[variant] || icons.default} />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { expedientes, plazos, loading } = useApp();

  const activos = expedientes.filter(e => e.estado === 'activo').length;
  const pendientes = plazos.filter(p => p.estado === 'pendiente').length;
  const vencidos = plazos.filter(p => {
    if (p.estado !== 'pendiente') return false;
    return isBefore(parseISO(p.fechaLimite), new Date());
  }).length;
  
  const porVencer = plazos.filter(p => {
    if (p.estado !== 'pendiente') return false;
    const dias = differenceInDays(parseISO(p.fechaLimite), new Date());
    return dias >= 0 && dias <= 7;
  }).length;

  const vencidosList = plazos.filter(p => p.estado === 'pendiente' && isBefore(parseISO(p.fechaLimite), new Date()));
  const activosList = expedientes.filter(e => e.estado === 'activo').slice(0, 6);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Panel de Control</h1>
        <p className="text-slate-500 mt-1">Resumen de actividad del sistema</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard label="Expedientes Activos" value={activos} variant="default" />
        <StatCard label="Plazos Pendientes" value={pendientes} variant="default" />
        <StatCard label="Plazos Vencidos" value={vencidos} variant={vencidos > 0 ? 'danger' : 'success'} />
        <StatCard label="Por Vencer" value={porVencer} variant={porVencer > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Plazos Vencidos</span>
            </div>
            <Link to="/plazos" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="card-body p-0">
            {vencidosList.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-emerald-600 font-medium">Sin plazos vencidos</p>
                <p className="text-sm text-slate-500 mt-1">Excelente gestión de tiempos</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Expediente</th>
                    <th className="px-4 py-3">Días</th>
                  </tr>
                </thead>
                <tbody>
                  {vencidosList.slice(0, 5).map(p => (
                    <tr key={p._id} className="hover:bg-red-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{p.descripcion}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">
                        {p.expedienteId?.numero || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge badge-danger">
                          +{differenceInDays(new Date(), parseISO(p.fechaLimite))} días
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Expedientes Activos</span>
            </div>
            <Link to="/expedientes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="card-body p-0">
            {activosList.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">Sin expedientes activos</p>
                <p className="text-sm text-slate-500 mt-1">Crea tu primer expediente</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="px-4 py-3">Número</th>
                    <th className="px-4 py-3">Carátula</th>
                    <th className="px-4 py-3">Jurisdicción</th>
                  </tr>
                </thead>
                <tbody>
                  {activosList.map(e => (
                    <tr key={e._id}>
                      <td className="px-4 py-3 text-sm font-mono text-blue-600">{e.numero}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 truncate max-w-xs">{e.caratula}</td>
                      <td className="px-4 py-3">
                        <span className="badge badge-info">{e.jurisdiccion}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
