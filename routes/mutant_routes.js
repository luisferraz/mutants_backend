const express = require("express");
const { authenticateToken } = require("../middlewares/user_auth");
const multer = require("../middlewares/image_upload");
const {
  createMutant,
  updateMutant,
  findMutantByIdOrName,
  findMutantsByAbility,
  findMutantPhoto,
  deleteMutant,
  findAllMutants,
  findTopAbilities,
} = require("../controllers/mutant_controller");

const routerMutant = express.Router();

//Endpoint de cadastro de mutante
routerMutant.post(
  "/",
  authenticateToken,
  multer.upload.single("photo"),
  createMutant
);

//Endpoint de atualização de mutante
routerMutant.put(
  "/:id",
  authenticateToken,
  multer.upload.single("photo"),
  updateMutant
);

//Endpoint de retorno de um mutante pelo ID ou nome
routerMutant.get("/", authenticateToken, findMutantByIdOrName);

//Endpoint de busca de mutante por Habilidade
routerMutant.get("/ability/", authenticateToken, findMutantsByAbility);

//Endpoint de busca do top 3 habilidades
routerMutant.get("/ability/top", authenticateToken, findTopAbilities);

//Endpoint de retorno da foto de um mutante
routerMutant.get("/photo/", authenticateToken, findMutantPhoto);

//Endpoint de remoção de um mutant
routerMutant.delete("/:id", authenticateToken, deleteMutant);

//Endpoint para buscar todos os mutantes
routerMutant.get("/all/", authenticateToken, findAllMutants);

module.exports = routerMutant;
