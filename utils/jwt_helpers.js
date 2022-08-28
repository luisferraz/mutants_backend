const jwt = require("jsonwebtoken");

const jwtTokens = ({ id, email }) => {
  const user = { id, email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.EXPIRES,
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRES,
  });

  return ({accessToken, refreshToken})
};

module.exports= {
  jwtTokens
}
