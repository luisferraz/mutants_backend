const db = require("../models");
const mutant = require("../models/mutant");
var stream = require("stream");
const mutants_abilities = require("../models/mutants_abilities");

const Mutant = db.mutants;
const Ability = db.abilities;

//Cria um novo mutante no banco de dados
const createMutant = async (req, res) => {
  try {
    let mutantName = req.body.name;

    if (!mutantName) {
      return res.status(400).json({ error: "Nome inválido" });
    }

    if (req.file == undefined) {
      return res.status(400).json({ error: "Imagem nao enviada." });
    }

    //Verifica se ja existe um registro com o mesmo nome
    const findMutant = await Mutant.findOne({
      where: {
        name: mutantName,
      },
    });

    if (findMutant) {
      return res.status(400).json({ error: "Registro ja existente." });
    }

    //Pega as abilities passadas como array e as insere no banco
    const abilitiesStr = req.body.ability;
    if (abilitiesStr.length > 3) {
      return res
        .status(400)
        .json({ error: "3 habilidades permitidas no máximo" });
    }
    const abilities = await Promise.all(
      abilitiesStr.map(async (element) => {
        const [ability] = await Ability.findOrCreate({
          where: { ability: element.toUpperCase() },
        });
        return ability;
      })
    );

    //Cria o mutante no banco de dados
    const mutant = await Mutant.create({
      name: mutantName,
      imageType: req.file.mimetype,
      imageName: req.file.filename,
    });

    //Atribui as suas habilidades
    await mutant.setAbilities(abilities, { individualHooks: true });

    return res.status(201).json({ mutant });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

//Atualiza um mutante no bd
const updateMutant = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Mutant id inválido." });
    }
    let { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "nome inválido" });
    }
    //Procura o mutante na base
    const mutant = await Mutant.findByPk(id);
    if (!mutant) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }

    //Pega as abilities passadas como array e as insere no banco
    const abilitiesStr = req.body.ability;
    if (abilitiesStr.length > 3) {
      return res
        .status(400)
        .json({ error: "3 habilidades permitidas no máximo" });
    }
    const abilities = await Promise.all(
      abilitiesStr.map(async (element) => {
        const [ability] = await Ability.findOrCreate({
          where: { ability: element.toUpperCase() },
        });
        return ability;
      })
    );

    mutant.update({
      name,
      imageType: req.file.mimetype,
      imageName: req.file.filename,
    });
    mutant.save();
    await mutant.setAbilities(abilities, { individualHooks: true });
    mutant.reload();
    return res.status(200).json({ mutant });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

//Remove um mutante no bd
const deleteMutant = async (req, res) => {
  try {
    let { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Mutant id inválido." });
    }

    //Procura o mutante na base
    const mutant = await Mutant.findByPk(id);
    if (!mutant) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }

    mutant.destroy();
    return res.status(200).send();
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Busca um mutante pelo parametro
const findMutantByParam = async (req, res) => {
  try {
    let { name, ability, id } = req.query;
    let where = {};
    if (name) {
      where.name = name;
    }
    if (ability) {
      where.ability = ability;
    }
    if (id) {
      where.id = id;
    }
    //Procura o mutante na base
    const mutant = await Mutant.findOne({
      where: where,
      include: {
        association: "abilities",
        required: true,
        attributes: ["ability"],
        through: {
          attributes: [],
        },
      },
      // nest: true,
    });
    if (!mutant) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }
    return res.status(200).json({ mutant });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

//! MUDAR IMAGEM PRA ESTATICA (EXPRESS.STATIC + SALVAR NA PASTA + SALVAR O CAMINHO NO BANCO)
const findMutantPhoto = async (req, res) => {
  let { id } = req.query;

  Mutant.findByPk(id)
    .then((mutant) => {
      res.set("Content-Type", mutant.imageType);
      res.sendFile(
        `${appRoot}/resources/static/assets/uploads/${mutant.imageName}`
      );

      // var foto = Buffer.from();
      // var readStream = new stream.PassThrough();
      // readStream.end(foto);

      // res.set(
      //   "Content-disposition",
      //   "attachment; filename=" + mutant.imageName
      // );
      // res.set("Content-Type", mutant.imageType);

      // readStream.pipe(res);
    })
    .catch((err) => {
      res.status(403).json({ error: err.message });
    });
};

module.exports = {
  createMutant,
  updateMutant,
  deleteMutant,
  findMutantByParam,
  findMutantPhoto,
};
