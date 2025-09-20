// routes/user.js
const express = require("express");
const router = express.Router();
const { Store, Rating, User, sequelize } = require("../models");
const { Op } = require("sequelize");
const { auth } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// ✅ Get stores (with filters + avg + user’s rating + sorting)
router.get("/stores", auth, async (req, res) => {
  try {
    const { name, address, sortBy = "id", order = "ASC" } = req.query;

    let whereCondition =
      req.user.role === "owner"
        ? { ownerId: req.user.id }
        : { ownerId: { [Op.ne]: null } };

    if (name) whereCondition.name = { [Op.iLike]: `%${name}%` };
    if (address) whereCondition.address = { [Op.iLike]: `%${address}%` };

    const validSort = ["id", "name", "address", "email", "createdAt"];
    const sortCol = validSort.includes(sortBy) ? sortBy : "id";

    const stores = await Store.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "address",
        "email",
        "ownerId",
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
      order: [[sortCol, order.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
      raw: true,   // ✅ ensures plain objects
    });

    // fetch current user’s ratings
    const storeIds = stores.map((s) => s.id);
    const userRatings = storeIds.length
      ? await Rating.findAll({
          where: { userId: req.user.id, storeId: { [Op.in]: storeIds } },
          attributes: ["storeId", "rating"],
          raw: true,
        })
      : [];

    const ratingMap = {};
    userRatings.forEach((r) => (ratingMap[r.storeId] = r.rating));

    // build final response
    const response = stores.map((s) => ({
      ...s, // now safe, because `s` is a plain object
      avgRating: Number(s.avgRating) || 0,
      ratingCount: Number(s.ratingCount) || 0,
      userRating: ratingMap[s.id] ?? null,
    }));

    res.json(response);
  } catch (err) {
    console.error("❌ Error fetching stores:", err);
    res.status(500).json({ message: "Error fetching stores" });
  }
});

// ✅ Submit rating
router.post("/stores/:storeId/rate", auth, async (req, res) => {
  try {
    const { score, comment } = req.body;
    const { storeId } = req.params;

    const numericScore = Number(score);
    if (!numericScore || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ message: "Score must be 1-5" });
    }

    const existing = await Rating.findOne({
      where: { userId: req.user.id, storeId },
    });
    if (existing) {
      return res.status(400).json({ message: "You have already rated this store" });
    }

    const rating = await Rating.create({
      rating: numericScore,
      comment: comment || null,
      userId: req.user.id,
      storeId,
    });

    res.json(rating.get({ plain: true })); // ✅ send plain object
  } catch (err) {
    console.error("❌ Error submitting rating:", err);
    res.status(500).json({ message: "Error submitting rating" });
  }
});

// ✅ Get all ratings for a store (with user info)
router.get("/store-ratings/:storeId", async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { storeId: req.params.storeId },
      include: [{ model: User, attributes: ["id", "name", "email"], as: "User" }],
      order: [["createdAt", "DESC"]],
    });

    res.json(
      ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: r.User ? { id: r.User.id, name: r.User.name, email: r.User.email } : null,
      }))
    );
  } catch (err) {
    console.error("❌ Error fetching ratings:", err);
    res.status(500).json({ message: "Error fetching ratings" });
  }
});

// ✅ Update password
router.put("/password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Old password is incorrect" });

    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8-16 characters, include 1 uppercase letter and 1 special character",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    console.error("❌ Error updating password:", err);
    res.status(500).json({ message: "Error updating password" });
  }
});

module.exports = router;