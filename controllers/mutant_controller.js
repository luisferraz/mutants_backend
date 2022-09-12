const db = require("../models");
const path = require("path");
const { Op, QueryTypes } = require("sequelize");
const fs = require("fs");
const { Sequelize, sequelize } = require("../models");

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
      return res
        .status(400)
        .json({ error: "Já existe um mutante registrado com este nome." });
    }

    //Pega as abilities passadas como array e as insere no banco

    let abilitiesStr = [].concat(req.body.ability);
    abilitiesStr = abilitiesStr.filter((str) => str);

    if (abilitiesStr.length > 3) {
      return res
        .status(400)
        .json({ error: "3 habilidades permitidas no máximo" });
    }
    if (abilitiesStr.length <= 0) {
      return res.status(400).json({ error: "Nenhuma habilidade informada" });
    }

    const abilities = await Promise.all(
      abilitiesStr.map(async (element) => {
        if (element) {
          const [ability] = await Ability.findOrCreate({
            where: { ability: element.toUpperCase() },
          });
          return ability;
        }
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

    const returnMutant = await Mutant.findByPk(mutant.id, {
      include: {
        association: "abilities",
        required: true,
        attributes: ["ability"],
        through: {
          attributes: [],
        },
      },
    });
    return res.status(201).json(returnMutant);
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
    const mutant = await Mutant.findByPk(id, {
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

    //Pega as abilities passadas como array e as insere no banco
    let abilitiesStr = [].concat(req.body.ability);
    abilitiesStr = abilitiesStr.filter((str) => str);

    if (abilitiesStr.length > 3) {
      return res
        .status(400)
        .json({ error: "3 habilidades permitidas no máximo" });
    }
    if (abilitiesStr.length <= 0) {
      return res.status(400).json({ error: "Nenhuma habilidade informada" });
    }
    const abilities = await Promise.all(
      abilitiesStr.map(async (element) => {
        if (element) {
          const [ability] = await Ability.findOrCreate({
            where: { ability: element.toUpperCase() },
          });
          return ability;
        }
      })
    );

    //Deleta a imagem atual do mutante
    //
    deleteMutantPhoto(mutant.imageName);

    await mutant.update({
      name,
      imageType: req.file.mimetype,
      imageName: req.file.filename,
    });
    // await mutant.save();
    await mutant.setAbilities(abilities, { individualHooks: true });
    await mutant.reload();
    return res.status(200).json(mutant);
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
    deleteMutantPhoto(mutant.imageName);
    mutant.destroy();
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// Busca um mutante pelo parâmetro
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
    return res.status(200).json(mutant);
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
          ability: {
            [Op.iLike]: `%${ability.toUpperCase()}%`,
          },
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
    const mutantsWithAbilities = await Promise.all(
      await Mutant.findAll({
        where: {
          id: mutants.map((mutant) => mutant.id),
        },
        include: {
          association: "abilities",
          required: true,
          attributes: ["ability"],
          through: {
            attributes: [],
          },
        },
      })
    );

    return res.status(200).json(mutantsWithAbilities);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const findMutantPhoto = async (req, res) => {
  try {
    let { id } = req.query;

    const mutant = await Mutant.findByPk(id);

    if (mutant) {
      var options = {
        root: path.join(appRoot, "/resources/static/assets/uploads/"),
        dotfiles: "deny",
        headers: {
          "Content-Type": mutant.imageType,
        },
      };
      return res.sendFile(mutant.imageName, options);
    } else {
      return res.status(400).json({ error: "Mutante nao encontrado " });
    }
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
};

const deleteMutantPhoto = (imageName) => {
  try {
    if (imageName) {
      fs.unlink(
        path.join(appRoot, "/resources/static/assets/uploads/", imageName),
        (err) => {
          if (err) {
            console.log(`Erro ao remover imagem: ${err.message}`);
          }
          console.log(`Imagem ${imageName} deletada com sucesso.`);
        }
      );
    }
  } catch (e) {
    console.log("Erro ao remover imagem.");
  }
};

const findAllMutants = async (req, res) => {
  try {
    const mutants = await Mutant.findAll({
      include: {
        association: "abilities",
        required: true,
        attributes: ["ability"],
        through: {
          attributes: [],
        },
      },
      order: [["id"]],
    });
    return res.status(200).json(mutants);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const findTopAbilities = async (req, res) => {
  try {
    const topAbilities = await sequelize.query(
      'SELECT ability, COUNT (*) AS count FROM abilities LEFT JOIN mutant_abilities ON (abilities.id = mutant_abilities."abilityId") GROUP BY ability ORDER BY 2 DESC, 1 LIMIT 3',
      { type: QueryTypes.SELECT }
    );
    return res.status(200).json(topAbilities);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e.message });
  }
};

module.exports = {
  createMutant,
  updateMutant,
  deleteMutant,
  findMutantByIdOrName,
  findMutantsByAbility,
  findMutantPhoto,
  findAllMutants,
  findTopAbilities,
};
