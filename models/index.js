//importing modules
const { Sequelize, DataTypes } = require("sequelize");

//Database connection with dialect of postgres specifying the database we are using
//port for my database is 5433
//database name is discover
const sequelize = new Sequelize({
  host: "localhost",
  port: 5432,
  password: "backend",
  username: "backend",
  database: "backend_app",
  dialect: "postgres",
  query: {
    raw: true,
  },
});

//checking if connection is done
sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected to backend_app`);
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// connecting to model
db.users = require("./user")(sequelize, DataTypes);
db.mutants = require("./mutant")(sequelize, DataTypes);

//synchronizing the database and forcing it to false so we dont lose data
// db.sequelize.sync({ force: true }).then(() => {
db.sequelize.sync({ force: process.env.FORCE_RESYNC === "YES" }).then(() => {
  console.log(
    `DB sincronizado ${
      process.env.FORCE_RESYNC === "NO" ? "com" : "sem"
    } persistência dos dados.`
  );
});

//exporting the module
module.exports = db;
