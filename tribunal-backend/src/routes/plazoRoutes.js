const express = require('express');
const router = express.Router();
const Plazo = require('../models/Plazo');

router.get('/', async (req, res) => {
  try {
    const plazos = await Plazo.find()
      .populate('expedienteId', 'numero caratula')
      .sort({ fechaLimite: 1 });
    res.json(plazos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/vencidos', async (req, res) => {
  try {
    const plazos = await Plazo.find({
      fechaLimite: { $lt: new Date() },
      estado: 'pendiente'
    })
    .populate('expedienteId', 'numero caratula')
    .sort({ fechaLimite: 1 });
    res.json(plazos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/proximos', async (req, res) => {
  try {
    const hoy = new Date();
    const enUnaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    const plazos = await Plazo.find({
      fechaLimite: { $gte: hoy, $lte: enUnaSemana },
      estado: 'pendiente'
    })
    .populate('expedienteId', 'numero caratula')
    .sort({ fechaLimite: 1 });
    res.json(plazos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const plazo = await Plazo.findById(req.params.id)
      .populate('expedienteId', 'numero caratula');
    if (!plazo) return res.status(404).json({ message: 'No encontrado' });
    res.json(plazo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plazo = new Plazo(req.body);
    const nuevoPlazo = await plazo.save();
    res.status(201).json(nuevoPlazo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plazo = await Plazo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plazo) return res.status(404).json({ message: 'No encontrado' });
    res.json(plazo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const plazo = await Plazo.findByIdAndDelete(req.params.id);
    if (!plazo) return res.status(404).json({ message: 'No encontrado' });
    res.json({ message: 'Plazo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
