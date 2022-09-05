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
    let { id } = req.query;
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
const findMutantByIdOrName = async (req, res) => {
  try {
    let { name, id } = req.query;

    if (!name && !id) {
      return res.status(400).json({ error: "ID/Name não informado." });
    }

    let where = {};
    if (name) {
      where.name = name;
    } else {
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
    });
    if (!mutant) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }
    return res.status(200).json({ mutant });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Busca um mutante pela habilidade
const findMutantsByAbility = async (req, res) => {
  try {
    let { ability } = req.query;

    if (!ability) {
      return res.status(400).json({ error: "Ability não informado." });
    }

    //Procura os mutantes na base
    const mutants = await Mutant.findAll({
      include: {
        association: "abilities",
        required: true,
        where: {
          ability: ability.toUpperCase(),
        },
        attributes: ["ability"],
        through: {
          attributes: [],
        },
      },
    });
    if (!mutants) {
      return res.status(400).json({ error: "Registro não encontrado" });
    }
    //Buscamos um a um os mutantes para recarregar a lista de habilidades
    const mutantsWithAbilities = await Promise.all(
      mutants.map(async (mutant) => {
        const newMutant = await Mutant.findByPk(mutant.id, {
          include: {
            association: "abilities",
            required: true,
            attributes: ["ability"],
            through: {
              attributes: [],
            },
          },
        });
        return newMutant;
      })
    );

    return res.status(200).json({ mutants: mutantsWithAbilities });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const findMutantPhoto = async (req, res) => {
  try {
    let { id } = req.query;

    const mutant = await Mutant.findByPk(id);

    if (mutant) {
      res.set("Content-Type", mutant.imageType);
      return res.sendFile(
        `${appRoot}/resources/static/assets/uploads/${mutant.imageName}`
      );
    } else {
      return res.status(400).json({ error: "Mutante nao encontrado " });
    }
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
};

module.exports = {
  createMutant,
  updateMutant,
  deleteMutant,
  findMutantByIdOrName,
  findMutantsByAbility,
  findMutantPhoto,
};
