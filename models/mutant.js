module.exports = (sequelize, DataTypes) => {
  const Mutant = sequelize.define(
    "mutant",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        // validate: {},
      },
      imageType: DataTypes.STRING,
      imageName: DataTypes.STRING,
      imageData: DataTypes.BLOB('long')
    },
    { timestamps: true }
  );
  return Mutant;
};
