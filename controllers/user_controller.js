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
      //A senha nao vai ser criptografada pq vamos cadastrar usuários direto no db depois
      // password: await bcrypt.hash(password.toString(), 10),
      password: password.toString(),
    };

    //Cria o usuário no banco de dados com esses dados
    const user = await User.create(dados);

    //Se a criação do usuário deu certo, retornamos 201 created
    if (user) {
      return res.status(201).json({ ...omitPassword(user.get()) });
    } else {
      return res.status(400).json({ error: "Dados inválidos" });
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

    if (!email || !password) {
      return res.status(400).json({ error: "Dados inválidos" });
    }
    //Busca o usuário no banco pelo email
    const user = await User.findOne({ where: { email } });
    //Se nao encontrado, retorna http 401 email nao encontrado
    if (!user) {
      return res.status(401).json({ error: "Email nao encontrado" });
    }

    //Se encontrado, verifica a senha com bcrypt.compare
    // const validPassword = await bcrypt.compare(password.toString(), user.password);
    const validPassword = password.toString() === user.password;

    //Se a senha for invalida, retorna 401 senha incorreta
    if (!validPassword) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    //Se a validação esta correta, retorna o JWT
    let tokens = jwtTokens(user.id, user.email);

    //Salva um cookie com o refresh_token
    res.cookie("refresh_token", tokens.refreshToken, {
      maxAge: 90000,
      httpOnly: true,
    });

    return res.status(200).json({ ...omitPassword(user.get()), tokens });
  } catch (error) {
    return res.status(500).send(error);
  }
};

//Retorna todos os usuários da tabela Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const newUsers = users.map((u) => omitPassword(u.get()));
    return res.status(200).json({ users: newUsers });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

function omitPassword(user) {
  var { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

module.exports = {
  signUp,
  login,
  getAllUsers,
};
