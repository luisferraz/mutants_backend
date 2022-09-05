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
  "/",
  authenticateToken,
  multer.upload.single("foto"),
  mutant_controller.updateMutant
);

//Endpoint de retorno de um mutante baseado nos parametros
routerMutant.get("/", authenticateToken, mutant_controller.findMutantByParam);

//Endpoint de retorno da foto de um mutante
routerMutant.get("/photo/", authenticateToken, mutant_controller.findMutantPhoto);



module.exports = routerMutant;
