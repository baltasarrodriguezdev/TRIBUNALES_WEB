const express = require('express');
const router = express.Router();
const Tasa = require('../models/Tasa');

router.get('/', async (req, res) => {
  try {
    const tasas = await Tasa.find({ vigente: true });
    res.json(tasas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:tipo', async (req, res) => {
  try {
    const tasa = await Tasa.findOne({ tipo: req.params.tipo, vigente: true });
    if (!tasa) return res.status(404).json({ message: 'No encontrado' });
    res.json(tasa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const tasa = new Tasa(req.body);
    const nuevaTasa = await tasa.save();
    res.status(201).json(nuevaTasa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const tasa = await Tasa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!tasa) return res.status(404).json({ message: 'No encontrado' });
    res.json(tasa);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
