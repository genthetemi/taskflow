const Shkolla = require("../models/shkolla.model");

exports.createShkolla = async (req, res) => {
  try {
    const result = await Shkolla.create(req.body);
    res.json({ message: "Shkolla u shtua", data: result });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAllShkolla = async (req, res) => {
  try {
    const result = await Shkolla.getAll();
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getShkollaById = async (req, res) => {
  try {
    const result = await Shkolla.getById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateShkolla = async (req, res) => {
  try {
    await Shkolla.update(req.params.id, req.body);
    res.json({ message: "Shkolla u përditësua" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteShkolla = async (req, res) => {
  try {
    await Shkolla.delete(req.params.id);
    res.json({ message: "Shkolla u fshi" });
  } catch (err) {
    res.status(500).json(err);
  }
};