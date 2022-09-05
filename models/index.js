const { Sequelize, DataTypes } = require("sequelize");

//Instancia da conexão com o banco de dados PostrgreSQL
const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  dialect: "postgres",
  // query: {
  //   raw: true,
  // },
});

//
sequelize
  .authenticate()
  .then(() => {
    console.log(
      `Conexão criada para banco de dados ${process.env.DB_DATABASE}`
    );
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Conectando aos modelos
db.users = require("./user")(sequelize, DataTypes);
db.mutants = require("./mutant")(sequelize, DataTypes);
db.abilities = require("./ability")(sequelize, DataTypes);
db.mutants_abilities = require("./mutants_abilities")(sequelize, DataTypes);

//Definindo as associações
db.mutants.belongsToMany(db.abilities, {
  through: db.mutants_abilities,
  as: "abilities",
  hooks: true,
});

db.abilities.belongsToMany(db.mutants, {
  through: db.mutants_abilities,
  as: "mutants",
  hooks: true,
});

//Sincronizando o banco
// Force = True, dropa e recria todas as estruturas
// Force = False, recria o que precisar, sem dropar tudo
// db.sequelize.sync({ force: true }).then(() => {
db.sequelize.sync({ force: process.env.FORCE_RESYNC === "YES" }).then(() => {
  console.log(
    `DB sincronizado ${
      process.env.FORCE_RESYNC === "NO" ? "com" : "sem"
    } persistência dos dados.`
  );
});

module.exports = db;
