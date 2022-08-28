const express = require("express");
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

//exporting module
module.exports = {
  verifyNewUser,
};
