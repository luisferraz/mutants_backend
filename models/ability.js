module.exports = (sequelize, DataTypes) => {
  const Ability = sequelize.define(
    "ability",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      ability: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
          this.setDataValue("ability", value.toUpperCase());
        },
        get() {
          const rawValue = this.getDataValue("ability");
          return rawValue ? rawValue.toUpperCase() : null;
        }
      },
    },
    { timestamps: true }
  );
  return Ability;
};
