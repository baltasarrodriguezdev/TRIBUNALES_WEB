import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [expedientes, setExpedientes] = useState([]);
  const [plazos, setPlazos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpedientes = async () => {
    try {
      const data = await api.expedientes.getAll();
      setExpedientes(data);
    } catch (err) {
      setError('Error al cargar expedientes');
    }
  };

  const fetchPlazos = async () => {
    try {
      const data = await api.plazos.getAll();
      setPlazos(data);
    } catch (err) {
      setError('Error al cargar plazos');
    }
  };

  const fetchPlantillas = async () => {
    try {
      const data = await api.plantillas.getAll();
      setPlantillas(data);
    } catch (err) {
      setError('Error al cargar plantillas');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchExpedientes(), fetchPlazos(), fetchPlantillas()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const value = {
    expedientes,
    plazos,
    plantillas,
    loading,
    error,
    refreshExpedientes: fetchExpedientes,
    refreshPlazos: fetchPlazos,
    refreshPlantillas: fetchPlantillas,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
