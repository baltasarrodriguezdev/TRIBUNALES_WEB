import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Expedientes from './pages/Expedientes';
import Plazos from './pages/Plazos';
import CalculadoraPlazos from './pages/CalculadoraPlazos';
import CalculadoraIntereses from './pages/CalculadoraIntereses';
import Plantillas from './pages/Plantillas';

const menuItems = [
  { path: '/', label: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/expedientes', label: 'Expedientes', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { path: '/plazos', label: 'Plazos Legales', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/calculadora-plazos', label: 'Calc. Plazos', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/calculadora-intereses', label: 'Intereses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/plantillas', label: 'Plantillas', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TRIBUNAL</h1>
            <p className="text-xs text-slate-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            {item.label}
            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 rounded-full bg-blue-300" />
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400">Estado del sistema</span>
          </div>
          <p className="text-sm text-white font-medium">MongoDB Conectado</p>
        </div>
      </div>
    </aside>
  );
}

function Header() {
  const currentDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-40">
      <div>
        <h2 className="text-sm font-medium text-slate-900 capitalize">{currentDate}</h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">Usuario</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
            A
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Sidebar />
        <Header />
        <main className="ml-64 pt-16 min-h-screen bg-slate-50">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/expedientes" element={<Expedientes />} />
              <Route path="/plazos" element={<Plazos />} />
              <Route path="/calculadora-plazos" element={<CalculadoraPlazos />} />
              <Route path="/calculadora-intereses" element={<CalculadoraIntereses />} />
              <Route path="/plantillas" element={<Plantillas />} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
