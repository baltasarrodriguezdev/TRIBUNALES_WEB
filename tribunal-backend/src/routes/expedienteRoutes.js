const express = require('express');
const router = express.Router();
const Expediente = require('../models/Expediente');

router.get('/', async (req, res) => {
  try {
    const expedientes = await Expediente.find().sort({ updatedAt: -1 });
    res.json(expedientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id);
    if (!expediente) return res.status(404).json({ message: 'No encontrado' });
    res.json(expediente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const expediente = new Expediente(req.body);
    const nuevoExpediente = await expediente.save();
    res.status(201).json(nuevoExpediente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const expediente = await Expediente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!expediente) return res.status(404).json({ message: 'No encontrado' });
    res.json(expediente);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expediente = await Expediente.findByIdAndDelete(req.params.id);
    if (!expediente) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Expediente eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
