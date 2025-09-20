const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Rating extends Model {
    static associate(models) {
      // A Rating belongs to one User
      Rating.belongsTo(models.User, { foreignKey: "userId", as: "user" });

      // A Rating belongs to one Store
      Rating.belongsTo(models.Store, { foreignKey: "storeId", as: "store" });
    }
  }

  Rating.init(
    {
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Rating",
    }
  );

  return Rating;
};