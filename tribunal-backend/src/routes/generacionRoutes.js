const express = require('express');
const multer = require('multer');
const router = express.Router();
const generadorService = require('../services/generadorService');
const templateService = require('../services/templateService');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no soportado. Use PDF, Word (.docx) o texto (.txt)'));
    }
  }
});

router.post('/analizar', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se proporcionó archivo' 
      });
    }

    const resultado = await generadorService.processDocument(req.file);
    
    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error en /analizar:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/generar', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No se proporcionó archivo' 
      });
    }

    const { plantillaId, useAI } = req.body;
    
    if (!plantillaId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere especificar plantillaId' 
      });
    }

    const analisis = await generadorService.processDocument(req.file);
    
    const generacion = await generadorService.generateWritten(
      plantillaId,
      analisis.datosExtraidos,
      { useAI: useAI !== 'false' }
    );

    await generadorService.saveGeneration({
      nombreArchivo: req.file.originalname,
      tipoArchivo: req.file.mimetype,
      textoExtraido: analisis.textoExtraido,
      datosExtraidos: analisis.datosExtraidos,
      plantillaId,
      escritoGenerado: generacion.escritoGenerado,
      usuario: req.body.usuario || 'anonymous'
    });

    res.json({
      success: true,
      data: {
        ...generacion,
        datosExtraidos: analisis.datosExtraidos,
        textoExtraido: analisis.textoExtraido.substring(0, 1000) + '...'
      }
    });
  } catch (error) {
    console.error('Error en /generar:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/generar-directo', async (req, res) => {
  try {
    const { datosExtraidos, plantillaId, useAI } = req.body;
    
    if (!datosExtraidos || !plantillaId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan datos requeridos' 
      });
    }

    const generacion = await generadorService.generateWritten(
      plantillaId,
      datosExtraidos,
      { useAI: useAI !== false }
    );

    res.json({
      success: true,
      data: generacion
    });
  } catch (error) {
    console.error('Error en /generar-directo:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/historial', async (req, res) => {
  try {
    const { estado, usuario, limit } = req.query;
    const generaciones = await generadorService.getGeneraciones({
      estado,
      usuario,
      limit: limit ? parseInt(limit) : 50
    });

    res.json({
      success: true,
      data: generaciones
    });
  } catch (error) {
    console.error('Error en /historial:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const generacion = await generadorService.updateGeneracionEstado(id, estado);
    
    if (!generacion) {
      return res.status(404).json({ 
        success: false, 
        error: 'Generación no encontrada' 
      });
    }

    res.json({
      success: true,
      data: generacion
    });
  } catch (error) {
    console.error('Error en /:id/estado:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/variables', async (req, res) => {
  try {
    const catalog = await templateService.getVariablesCatalog();
    res.json({
      success: true,
      data: catalog
    });
  } catch (error) {
    console.error('Error en /variables:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
