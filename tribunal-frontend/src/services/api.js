const API_URL = import.meta.env.VITE_API_URL || '/api';

async function uploadFile(endpoint, file, additionalData = {}) {
  const formData = new FormData();
  formData.append('archivo', file);
  
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la solicitud');
  }

  return response.json();
}

export const api = {
  expedientes: {
    getAll: () => fetch(`${API_URL}/expedientes`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/expedientes/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/expedientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/expedientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id) => fetch(`${API_URL}/expedientes/${id}`, { method: 'DELETE' }).then(r => r.json()),
  },
  
  plazos: {
    getAll: () => fetch(`${API_URL}/plazos`).then(r => r.json()),
    getVencidos: () => fetch(`${API_URL}/plazos/vencidos`).then(r => r.json()),
    getProximos: () => fetch(`${API_URL}/plazos/proximos`).then(r => r.json()),
    getById: (id) => fetch(`${API_URL}/plazos/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/plazos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/plazos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id) => fetch(`${API_URL}/plazos/${id}`, { method: 'DELETE' }).then(r => r.json()),
  },
  
  plantillas: {
    getAll: () => fetch(`${API_URL}/plantillas`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        return { success: true, data };
      }
      return data;
    }),
    getById: (id) => fetch(`${API_URL}/plantillas/${id}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/plantillas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    update: (id, data) => fetch(`${API_URL}/plantillas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
    delete: (id) => fetch(`${API_URL}/plantillas/${id}`, { method: 'DELETE' }).then(r => r.json()),
  },
  
  tasas: {
    getAll: () => fetch(`${API_URL}/tasas`).then(r => r.json()),
    getByTipo: (tipo) => fetch(`${API_URL}/tasas/${tipo}`).then(r => r.json()),
    create: (data) => fetch(`${API_URL}/tasas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(r => r.json()),
  },

  generar: {
    analizar: (file) => uploadFile('generar/analizar', file),
    
    generar: (file, plantillaId, useAI = true) => 
      uploadFile('generar/generar', file, { plantillaId, useAI }),
    
    generarDirecto: (datosExtraidos, plantillaId, useAI = true) => 
      fetch(`${API_URL}/generar/generar-directo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datosExtraidos, plantillaId, useAI })
      }).then(r => r.json()),
    
    getHistorial: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return fetch(`${API_URL}/generar/historial${query ? `?${query}` : ''}`).then(r => r.json());
    },
    
    updateEstado: (id, estado) => 
      fetch(`${API_URL}/generar/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      }).then(r => r.json()),
    
    getVariables: () => fetch(`${API_URL}/generar/variables`).then(r => r.json())
  }
};
