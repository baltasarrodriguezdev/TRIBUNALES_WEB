require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const expedienteRoutes = require('./routes/expedienteRoutes');
const plazoRoutes = require('./routes/plazoRoutes');
const plantillaRoutes = require('./routes/plantillaRoutes');
const tasaRoutes = require('./routes/tasaRoutes');
const generacionRoutes = require('./routes/generacionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    features: {
      generadorIA: true,
      groqConfigured: !!process.env.GROQ_API_KEY
    }
  });
});

app.use('/api/expedientes', expedienteRoutes);
app.use('/api/plazos', plazoRoutes);
app.use('/api/plantillas', plantillaRoutes);
app.use('/api/tasas', tasaRoutes);
app.use('/api/generar', generacionRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB Atlas');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
      console.log(`Groq API: ${process.env.GROQ_API_KEY ? 'Configurada' : 'No configurada (usará Ollama si está disponible)'}`);
    });
  })
  .catch((error) => {
    console.error('Error de conexión a MongoDB:', error);
  });
