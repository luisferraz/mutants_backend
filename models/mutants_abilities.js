module.exports = (sequelize, DataTypes) => {
  const mutants_abilities = sequelize.define(
    "mutant_abilities",
    {},
    {
      timestamps: false,
      hooks: {
        beforeUpdate: async (instance) => {
          let qty = await mutants_abilities.count({
            where: {
              mutantId: instance.dataValues.mutantId,
            },
          });
          if (qty >= 3) {
            return Promise.reject(new Error("Mutante ja possui 3 habilidades"));
          }
          return undefined;
        },
      },
    }
  );
  return mutants_abilities;
};
