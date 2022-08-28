//importing modules
const express = require("express");
const userController = require("../controllers/user_controller");
const { signUp, login } = userController;
const { verifyNewUser } = require("../middlewares/user_auth");

const router = express.Router();

//Endpoint de cadastro de usuário
//Executa a função verifyNewUser, que verifica se o usuário é novo mesmo
//Que por sua vez executa a funçào signup
router.post("/signup", verifyNewUser, signUp);
//login route
router.post("/login", login);

module.exports = router;
