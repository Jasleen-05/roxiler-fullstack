// src/models/User.js
const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  class User extends Model {
    // Add helper to verify password
    async verifyPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: {
            args: [20, 60],
            msg: "Name must be between 20 and 60 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: { msg: "Invalid email format" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        // we store hashed password; server side ensures pattern on raw password at creation
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 400],
            msg: "Address must be at most 400 characters",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("user", "owner", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        // Not automatically hashing here because routes might already hash.
        // Keep hooks optional — but if you want automatic hash on create, uncomment:
        // beforeCreate: async (user) => {
        //   if (user.password) user.password = await bcrypt.hash(user.password, 10);
        // },
      },
    }
  );

  return User;
};