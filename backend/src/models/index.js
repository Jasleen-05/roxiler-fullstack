// models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const StoreModel = require("./Store");
const RatingModel = require("./Rating");
const UserModel = require("./User");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

// Init models
const Store = StoreModel(sequelize, DataTypes);
const Rating = RatingModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);

// ================== ASSOCIATIONS ================== //

// Store ↔ Ratings (all ratings for a store)
Store.hasMany(Rating, { foreignKey: "storeId", as: "ratings", onDelete: "CASCADE" });
Rating.belongsTo(Store, { foreignKey: "storeId", as: "store" });

// User ↔ Ratings (all ratings made by a user)
User.hasMany(Rating, { foreignKey: "userId", as: "ratings", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: "userId", as: "user" });

// User ↔ Stores (owner relationship)
User.hasMany(Store, { foreignKey: "ownerId", as: "stores", onDelete: "CASCADE" });
Store.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

module.exports = { sequelize, Store, Rating, User };