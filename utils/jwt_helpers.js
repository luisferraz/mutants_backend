const jwt = require("jsonwebtoken");

const jwtTokens = (id, username) => {
  const user = { id, username };
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5 days",
  });
  const refreshToken = jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "14 days",
  });

  return { accessToken, refreshToken };
};

module.exports = {
  jwtTokens,
};
