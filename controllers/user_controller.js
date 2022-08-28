const bcrypt = require("bcrypt");
const db = require("../models");
const { jwtTokens } = require("../utils/jwt_helpers");

//Atribui o modelo users para a variável Users
const User = db.users;

//Inclui um novo usuário
const signUp = async (req, res) => {
  try {
    //Pega email e senha do body da requisição
    const { email, password } = req.body;

    //Cria um objeto com o email e a senha criptografada
    const dados = {
      email,
      password: await bcrypt.hash(password.toString(), 10),
    };

    //Cria o usuario no banco de dados com esses dados
    const user = await User.create(dados);

    //Se a criacao do usuario deu certo, retornamos 201 created
    if (user) {
      return res.status(201).json({ message: "Created" });
    } else {
      return res.status(404).json({ error: "Details are not correct" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Busca o usuário no banco pelo email
    const user = await User.findOne({ email });

    //Se nao encontrado, retorna http 401 email nao encontrado
    if (!user) {
      res.status(401).json({ error: "Email nao encontrado" });
    }

    //Se encontrado, verifica a senha com bcrypt.compare
    const validPassword = await bcrypt.compare(password, user.password);

    //Se a senha for invalida, retorna 401 senha incorreta
    if (!validPassword) {
      res.status(401).json({ error: "Senha incorreta" });
    }

    //Se a validação esta correta, retorna o JWT
    let tokens = jwtTokens(user.id, user.email);

    //Salva um cookie com o refresh_token
    res.cookie("refresh_token", tokens.refreshToken, {
      maxAge: process.env.JWT_EXPIRES,
      httpOnly: true,
    });

    console.log(tokens);
    res.status(200).json(tokens);
  } catch (error) {
    const errObj = {};
    error.errors.map((er) => {
      errObj[er.path] = er.message;
    });
    console.log(errObj);
    return res.status(400).send(errObj);
  }
};

module.exports = {
  signUp,
  login,
};
