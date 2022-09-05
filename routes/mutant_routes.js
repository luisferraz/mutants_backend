const express = require("express");
const mutant_controller = require("../controllers/mutant_controller");
const { authenticateToken } = require("../middlewares/user_auth");
const multer = require("../middlewares/image_upload");

const routerMutant = express.Router();

//Endpoint de cadastro de mutante
routerMutant.post(
  "/",
  authenticateToken,
  multer.upload.single("foto"),
  mutant_controller.createMutant
);

//Endpoint de atualização de mutante
routerMutant.put(
  "/:id",
  authenticateToken,
  multer.upload.single("foto"),
  mutant_controller.updateMutant
);

//Endpoint de retorno de um mutante pelo ID
routerMutant.get(
  "/",
  authenticateToken,
  mutant_controller.findMutantByIdOrName
);

//Endpoint de busca de mutante por Habilidade
routerMutant.get(
  "/ability/",
  authenticateToken,
  mutant_controller.findMutantsByAbility
);

//Endpoint de retorno da foto de um mutante
routerMutant.get(
  "/photo/",
  authenticateToken,
  mutant_controller.findMutantPhoto
);

//Endpoint de remoção de um mutant
routerMutant.delete("/", authenticateToken, mutant_controller.deleteMutant);


module.exports = routerMutant;
