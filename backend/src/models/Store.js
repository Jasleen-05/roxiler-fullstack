// src/models/Store.js
const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class Store extends Model {}

  Store.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: {
            args: [1, 200],
            msg: "Store name must be present and <= 200 chars",
          },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: {
            args: [0, 400],
            msg: "Address must be <= 400 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: { msg: "Store email must be valid" },
        },
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: true, // allow null if system stores exist without owner
      },
    },
    {
      sequelize,
      modelName: "Store",
    }
  );

  return Store;
};