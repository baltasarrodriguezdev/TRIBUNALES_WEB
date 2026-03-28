# Tribunal - Sistema de Gestión Legal

## Variables de Entorno

### Backend (Render)
```
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/tu_db
PORT=10000
```

### Frontend (Vercel)
No requiere variables de entorno si usas el proxy.

## Deploy Rápido

### Backend → Render
1. Crear cuenta en [render.com](https://render.com)
2. Conectar tu repositorio de GitHub
3. Crear un "Web Service"
4. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Agregar variables de entorno (MONGODB_URI, PORT)

### Frontend → Vercel
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar el repositorio de GitHub
3. Framework: Vite
4. Root Directory: `tribunal-frontend`
5. Deploy

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Render        │
│  (Frontend)     │────▶│  (Backend)     │
│                 │     │                 │
│  Vite + React  │     │  Express + API  │
└─────────────────┘     └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   MongoDB       │
                         │   Atlas         │
                         └─────────────────┘
```

## Nota sobre el Backend

El frontend está configurado con un proxy en `vercel.json` que reenvía las peticiones `/api/*` al backend en Render. Asegúrate de configurar CORS en el backend para permitir peticiones desde tu dominio de Vercel.
