const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models");

//Atribui o modelo users a variavel Users
const User = db.users;

//Verifica se o usuario é novo
const verifyNewUser = async (req, res, next) => {
  let { username, password } = req.body;

  //se os dados nao foram passados, retorna erro
  if (!username || !password) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  //Verifica se ja existe um usuario com o mesmo login
  try {
    const usernameCheck = await User.findOne({
      where: {
        username,
      },
    });

    if (usernameCheck) {
      return res
        .status(422)
        .json({ error: "Ja existe um usuário com esse nome!" });
    }

    next();
  } catch (e) {
    return res.status(500).json({ error: e.error });
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "Token inválido" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: error.message });
    }

    //Verifica se o usuário eh valido
    const user = await User.findOne({
      where: { id: decoded.user.id, username: decoded.user.username },
    });

    if (! user) {
      return res.status(401).json({ error: "Usuário invalido" });
    }

    req.user = user;
    next();
  });
};

//exporting module
module.exports = {
  verifyNewUser,
  authenticateToken,
};
