# Tribunal - Sistema de Gestión Legal

## Variables de Entorno

### Backend (Render)
```
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster.mongodb.net/tu_db
PORT=10000
GROQ_API_KEY=tu_api_key_de_groq
```

### Frontend (Vercel)
No requiere variables de entorno si usas el proxy.

## Deploy Rápido

### Backend → Render
1. Crear cuenta en [render.com](https://render.com)
2. Conectar tu repositorio de GitHub
3. Crear un "Web Service"
4. Configurar:
   - Root Directory: `tribunal-backend`
   - Build Command: `npm install`
   - Start Command: `npm run seed && npm start`
5. Agregar variables de entorno:
   - `MONGODB_URI`
   - `PORT=10000`
   - `GROQ_API_KEY`

### Frontend → Vercel
1. Crear cuenta en [vercel.com](https://vercel.com)
2. Importar el repositorio de GitHub
3. Framework: Vite
4. Root Directory: `tribunal-frontend`
5. Deploy

## Nueva Funcionalidad: Generador de Escritos con IA

El sistema incluye un generador de escritos judiciales que:
- Analiza documentos (PDF, Word, TXT)
- Extrae datos usando IA (Groq API)
- Selecciona plantillas y completa variables automáticamente
- Exporta a TXT o PDF

### Para usar el Generador IA:
1. Asegúrate de tener `GROQ_API_KEY` configurada en Render
2. Las 22 plantillas de ejemplo se cargan automáticamente al hacer deploy (npm run seed)
3. El frontend apunta a la API de producción en vercel.json

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

## Endpoints del Generador IA

- `POST /api/generar/analizar` - Analiza documento con IA
- `POST /api/generar/generar` - Genera escrito completo
- `POST /api/generar/generar-directo` - Genera sin documento
- `GET /api/generar/historial` - Historial de generaciones
- `GET /api/generar/variables` - Catálogo de variables
