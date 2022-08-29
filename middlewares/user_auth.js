const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../models");

//Atribui o modelo users a variavel Users
const User = db.users;

//Verifica se o usuario é novo
const verifyNewUser = async (req, res, next) => {
  let { email, password } = req.body;

  //se os dados nao foram passados, retorna erro
  if (!email || !password) {
    return res.status(400).json({ error: "Dados inválidos" });
  }

  try {
    const emailCheck = await User.findOne({
      where: {
        email: email,
      },
    });

    if (emailCheck) {
      return res
        .status(422)
        .json({ error: "Ja existe um usuário com esse email!" });
    }

    next();
  } catch (e) {
    return res.status(500).json({ error: e.error });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "Token inválido" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({ error: error.message });
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
