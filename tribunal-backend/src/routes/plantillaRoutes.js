const express = require('express');
const router = express.Router();
const Plantilla = require('../models/Plantilla');

router.get('/', async (req, res) => {
  try {
    const { busqueda, categoria, fuero, ordenar, limite = 50 } = req.query;
    
    const filtro = { activa: true };
    
    if (categoria && categoria !== 'todas') {
      filtro.categoria = categoria;
    }
    
    if (fuero && fuero !== 'todos') {
      filtro.fuero = fuero;
    }
    
    if (busqueda) {
      filtro.$or = [
        { titulo: { $regex: busqueda, $options: 'i' } },
        { contenido: { $regex: busqueda, $options: 'i' } }
      ];
    }
    
    let orden = { updatedAt: -1 };
    if (ordenar) {
      switch (ordenar) {
        case 'nombre':
          orden = { titulo: 1 };
          break;
        case 'nombreDesc':
          orden = { titulo: -1 };
          break;
        case 'variables':
          orden = { 'variables.length': -1 };
          break;
        case 'usos':
          orden = { usageCount: -1 };
          break;
        case 'creacion':
          orden = { createdAt: -1 };
          break;
        case 'modificacion':
        default:
          orden = { updatedAt: -1 };
      }
    }
    
    const plantillas = await Plantilla.find(filtro)
      .sort(orden)
      .limit(parseInt(limite));
    
    res.json({ success: true, data: plantillas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recientes', async (req, res) => {
  try {
    const plantillas = await Plantilla.find({ activa: true })
      .sort({ updatedAt: -1 })
      .limit(5);
    res.json({ success: true, data: plantillas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/populares', async (req, res) => {
  try {
    const plantillas = await Plantilla.find({ activa: true })
      .sort({ usageCount: -1 })
      .limit(5);
    res.json({ success: true, data: plantillas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/usar', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );
    if (!plantilla) return res.status(404).json({ success: false, error: 'No encontrada' });
    res.json({ success: true, data: plantilla });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/duplicar', async (req, res) => {
  try {
    const original = await Plantilla.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, error: 'No encontrada' });
    
    const duplicada = new Plantilla({
      titulo: `${original.titulo} (copia)`,
      categoria: original.categoria,
      fuero: original.fuero,
      contenido: original.contenido,
      variables: original.variables,
      ejemplo: original.ejemplo,
      activa: true
    });
    
    await duplicada.save();
    res.status(201).json({ success: true, data: duplicada });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.patch('/:id/destacar', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndUpdate(
      req.params.id,
      { $inc: { usoMinimo: 1 } },
      { new: true }
    );
    if (!plantilla) return res.status(404).json({ success: false, error: 'No encontrada' });
    res.json({ success: true, data: plantilla });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findById(req.params.id);
    if (!plantilla) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, data: plantilla });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plantilla = new Plantilla(req.body);
    const nuevaPlantilla = await plantilla.save();
    res.status(201).json({ success: true, data: nuevaPlantilla });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plantilla) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, data: plantilla });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndDelete(req.params.id);
    if (!plantilla) return res.status(404).json({ success: false, error: 'No encontrado' });
    res.json({ success: true, message: 'Plantilla eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
