const API_URL = 'https://tribunales-web-1.onrender.com/api';

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
    getAll: () => fetch(`${API_URL}/plantillas`).then(r => r.json()),
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
  }
};
