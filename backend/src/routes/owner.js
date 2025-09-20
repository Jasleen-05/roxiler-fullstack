// src/routes/owner.js
const express = require("express");
const router = express.Router();
const { Store, Rating, User, sequelize } = require("../models");
const { auth } = require("../middleware/auth");

// ================= GET ALL STORES (owned by logged-in owner) =================
router.get("/stores", auth, async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { sortBy = "id", order = "ASC" } = req.query;
    const validSort = ["id", "name", "email", "address", "createdAt"];
    const sortCol = validSort.includes(sortBy) ? sortBy : "id";

    const stores = await Store.findAll({
      where: { ownerId: req.user.id },
      order: [[sortCol, order.toUpperCase() === "DESC" ? "DESC" : "ASC"]],
    });

    const results = await Promise.all(
      stores.map(async (s) => {
        // aggregate stats
        const stats = await Rating.findAll({
          where: { storeId: s.id },
          attributes: [
            [sequelize.fn("COALESCE", sequelize.fn("AVG", sequelize.col("rating")), 0), "avgRating"],
            [sequelize.fn("COUNT", sequelize.col("id")), "ratingCount"],
          ],
          raw: true,
        });

        // get raters for this store
        const ratings = await Rating.findAll({
          where: { storeId: s.id }, // ✅ use s.id
          include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
          order: [["createdAt", "DESC"]],
        });

        const raters = ratings.map((r) => ({
          userId: r.userId,
          name: r.user ? r.user.name : "Unknown",
          email: r.user ? r.user.email : null,
          rating: r.rating,
          comment: r.comment || null,
          createdAt: r.createdAt,
        }));

        return {
          id: s.id,
          name: s.name,
          address: s.address,
          email: s.email,
          avgRating: Number(stats[0].avgRating) || 0,
          ratingCount: Number(stats[0].ratingCount) || 0,
          raters, // ✅ send raters list
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching owner stores:", err);
    res.status(500).json({ message: "Error fetching stores" });
  }
});

// ================= GET LIST OF USERS WHO RATED A SPECIFIC STORE =================
router.get("/stores/:storeId/raters", auth, async (req, res) => {
  try {
    if (req.user.role !== "owner") return res.status(403).json({ message: "Access denied" });

    const store = await Store.findOne({
      where: { id: req.params.storeId, ownerId: req.user.id },
    });
    if (!store) return res.status(404).json({ message: "Store not found or not yours" });

    const ratings = await Rating.findAll({
      where: { storeId: store.id },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    const users = ratings.map((r) => ({
      userId: r.userId,
      name: r.user ? r.user.name : "Unknown",
      email: r.user ? r.user.email : null,
      rating: r.rating,
      comment: r.comment || null,
      createdAt: r.createdAt,
    }));

    res.json({ store: { id: store.id, name: store.name }, raters: users });
  } catch (err) {
    console.error("❌ Error fetching raters:", err);
    res.status(500).json({ message: "Error fetching raters" });
  }
});

// ================= ADD STORE =================
router.post("/stores", auth, async (req, res) => {
  try {
    if (req.user.role !== "owner") return res.status(403).json({ message: "Access denied" });
    const { name, address, email } = req.body;
    if (!name || !address || !email) return res.status(400).json({ message: "All fields required" });

    const store = await Store.create({ name, address, email, ownerId: req.user.id });
    res.json(store.get({ plain: true })); // ✅ convert to plain object
  } catch (err) {
    console.error("❌ Error adding store:", err);
    res.status(500).json({ message: "Error adding store" });
  }
});

// ================= UPDATE STORE =================
router.put("/stores/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "owner") return res.status(403).json({ message: "Access denied" });
    const store = await Store.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!store) return res.status(404).json({ message: "Store not found or not yours" });

    const { name, address, email } = req.body;
    store.name = name ?? store.name;
    store.address = address ?? store.address;
    store.email = email ?? store.email;

    await store.save();
    res.json({ message: "Store updated", store: store.get({ plain: true }) });
  } catch (err) {
    console.error("❌ Error updating store:", err);
    res.status(500).json({ message: "Error updating store" });
  }
});

// ================= DELETE STORE =================
router.delete("/stores/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "owner") return res.status(403).json({ message: "Access denied" });
    const store = await Store.findOne({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!store) return res.status(404).json({ message: "Store not found or not yours" });

    await store.destroy();
    res.json({ message: "Store deleted" });
  } catch (err) {
    console.error("❌ Error deleting store:", err);
    res.status(500).json({ message: "Error deleting store" });
  }
});

module.exports = router;