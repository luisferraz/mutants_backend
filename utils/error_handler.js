const errorHandler = (err, req, res, next) => {
  if (typeof err === "string") {
    //Erros de requisição
    return res.status(400).json({ message: err });
  }
  
  if (err.name === "UnauthorizedError") {
    //Erros de autenticação
    return res.status(401).json({ message: "Token inválido" });
  }
  
  //Erros de aplicação
  return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;
