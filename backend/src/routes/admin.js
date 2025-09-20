// routes/admin.js
const express = require("express");
const router = express.Router();
const { Store, User, Rating, sequelize } = require("../models");
const { auth } = require("../middleware/auth");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

/**
 * NOTE:
 * - This file expects Store.hasMany(Rating, { as: "ratings", foreignKey: "storeId" })
 *   (and Rating.belongsTo(Store, { as: "store", foreignKey: "storeId" }))
 *   to be defined in models/index.js
 */

// -------------------- Dashboard summary --------------------
router.get("/summary", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);

    res.json({ usersCount, storesCount, ratingsCount });
  } catch (err) {
    console.error("❌ Error fetching summary:", err);
    res.status(500).json({ message: "Error fetching summary" });
  }
});

// -------------------- Create user (admin only) --------------------
router.post("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { name, email, password, address, role } = req.body;
    if (!name || !email || !password || !address || !role)
      return res.status(400).json({ message: "All fields required" });

    // check unique email first
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      address,
      role,
    });

    // Do not send password back
    const { password: pwd, ...safe } = user.toJSON();
    res.json(safe);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Error creating user" });
  }
});

// -------------------- Get users (filters) --------------------
router.get("/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { name, email, address, role } = req.query;
    const where = {};
    if (name && name.trim() !== "") where.name = { [Op.iLike]: `%${name}%` };
    if (email && email.trim() !== "") where.email = { [Op.iLike]: `%${email}%` };
    if (address && address.trim() !== "") where.address = { [Op.iLike]: `%${address}%` };
    if (role && role.trim() !== "") where.role = role;

    // Return safe attributes (no password)
    const users = await User.findAll({
      where,
      attributes: ["id", "name", "email", "address", "role"],
      order: [["id", "ASC"]],
    });

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// -------------------- User detail (admin) --------------------
router.get("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "address", "role"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const details = user.toJSON();

    // If owner, attach their stores with ratings summary
    if (user.role === "owner") {
      const stores = await Store.findAll({
        where: { ownerId: user.id },
        attributes: [
          "id",
          "name",
          "email",
          "address",
          [
            sequelize.fn("COALESCE", sequelize.fn("AVG", sequelize.col("ratings.rating")), 0),
            "avgRating",
          ],
          [
            sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("ratings.id"))),
            "ratingCount",
          ],
        ],
        include: [{ model: Rating, as: "ratings", attributes: [] }],
        group: ["Store.id"],
        order: [["id", "ASC"]],
      });

      // convert numeric strings to numbers for easier UI use
      const storesFormatted = stores.map((s) => {
        const json = s.toJSON();
        json.avgRating = Number(json.avgRating) || 0;
        json.ratingCount = Number(json.ratingCount) || 0;
        return json;
      });

      details.stores = storesFormatted;
    }

    res.json(details);
  } catch (err) {
    console.error("❌ Error fetching user details:", err);
    res.status(500).json({ message: "Error fetching user details" });
  }
});

// -------------------- Get stores (admin with filters & rating aggregates) --------------------
router.get("/stores", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const { name, email, address } = req.query;
    const where = {};
    if (name && name.trim() !== "") where.name = { [Op.iLike]: `%${name}%` };
    if (email && email.trim() !== "") where.email = { [Op.iLike]: `%${email}%` };
    if (address && address.trim() !== "") where.address = { [Op.iLike]: `%${address}%` };

    const stores = await Store.findAll({
      where,
      attributes: [
        "id",
        "name",
        "address",
        "email",
        [
          sequelize.fn("COALESCE", sequelize.fn("AVG", sequelize.col("ratings.rating")), 0),
          "avgRating",
        ],
        [
          sequelize.fn("COUNT", sequelize.fn("DISTINCT", sequelize.col("ratings.id"))),
          "ratingCount",
        ],
      ],
      include: [{ model: Rating, as: "ratings", attributes: [] }], // use alias 'ratings'
      group: ["Store.id"],
      order: [["id", "ASC"]],
    });

    // Format numbers
    const formatted = stores.map((s) => {
      const j = s.toJSON();
      return {
        ...j,
        avgRating: Number(j.avgRating) || 0,
        ratingCount: Number(j.ratingCount) || 0,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching stores:", err);
    res.status(500).json({ message: "Error fetching stores" });
  }
});

// -------------------- Delete User --------------------
router.delete("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// -------------------- Delete Store --------------------
router.delete("/stores/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

    const store = await Store.findByPk(req.params.id);
    if (!store) return res.status(404).json({ message: "Store not found" });

    await store.destroy();
    res.json({ message: "✅ Store deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting store:", err);
    res.status(500).json({ message: "Error deleting store" });
  }
});

module.exports = router;