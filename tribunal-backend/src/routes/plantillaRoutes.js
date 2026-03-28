const express = require('express');
const router = express.Router();
const Plantilla = require('../models/Plantilla');

router.get('/', async (req, res) => {
  try {
    const plantillas = await Plantilla.find().sort({ updatedAt: -1 });
    res.json(plantillas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findById(req.params.id);
    if (!plantilla) return res.status(404).json({ message: 'No encontrado' });
    res.json(plantilla);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plantilla = new Plantilla(req.body);
    const nuevaPlantilla = await plantilla.save();
    res.status(201).json(nuevaPlantilla);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plantilla) return res.status(404).json({ message: 'No encontrado' });
    res.json(plantilla);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const plantilla = await Plantilla.findByIdAndDelete(req.params.id);
    if (!plantilla) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Plantilla eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
