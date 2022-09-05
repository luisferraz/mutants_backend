//importing modules
const express = require("express");
const userController = require("../controllers/user_controller");
const { signUp, login, getAllUsers } = userController;
const { verifyNewUser, authenticateToken } = require("../middlewares/user_auth");

const router = express.Router();

//Endpoint de cadastro de usuário
//Executa a função verifyNewUser, que verifica se o usuário é novo mesmo
//Que por sua vez executa a função signup
router.post("/signup", verifyNewUser, signUp);

//Endpoint de Login
router.post("/login", login);

//Endpoint de retorno dos usuários
router.get("/", authenticateToken, getAllUsers);

module.exports = router;
