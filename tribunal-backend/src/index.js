require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const expedienteRoutes = require('./routes/expedienteRoutes');
const plazoRoutes = require('./routes/plazoRoutes');
const plantillaRoutes = require('./routes/plantillaRoutes');
const tasaRoutes = require('./routes/tasaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tu-frontend.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176']
    : '*',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/expedientes', expedienteRoutes);
app.use('/api/plazos', plazoRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/tasas', tasaRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error);
  });
