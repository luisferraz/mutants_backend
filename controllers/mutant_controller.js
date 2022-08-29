const db = require("../models");
const multer = require("multer");

const Mutant = db.mutants;

const createMutant = async (req, res) => {
  try {
    const mutant = await Mutant.create({
      nome: req.body.nome,
      imageType: req.file.mimetype,
      imageName: req.file.originalName,
      imageData: req.file.buffer,
    });
    return res.status(201).json({ mutant });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
