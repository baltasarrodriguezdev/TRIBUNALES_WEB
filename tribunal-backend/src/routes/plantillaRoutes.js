const express = require('express');
const router = express.Router();
const Plantilla = require('../models/Plantilla');

router.get('/', async (req, res) => {
  try {
    const plantillas = await Plantilla.find().sort({ updatedAt: -1 });
    res.json({ success: true, data: plantillas });
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
