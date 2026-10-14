const express = require("express");
const auth = require("../middleware/auth");
const CareerProfile = require("../models/CareerProfile");
const { validateCareerData } = require("../validation/career");
const router = express.Router();

// Private account storage only. This does not issue credentials or publish portfolios.
router.use(auth);
router.get("/profile", async (req, res) => {
  try {
    const profile = await CareerProfile.findByPk(req.user.id);
    res.json({ data: profile?.data || null, updatedAt: profile?.updatedAt || null });
  } catch { res.status(500).json({ message: "Career profile could not be loaded" }); }
});
router.put("/profile", express.json({ limit: "8mb" }), async (req, res) => {
  const data = validateCareerData(req.body);
  if (!data) return res.status(400).json({ message: "Invalid career profile" });
  try {
    await CareerProfile.upsert({ userId: req.user.id, data });
    res.json({ message: "Career profile saved" });
  } catch { res.status(500).json({ message: "Career profile could not be saved" }); }
});
module.exports = router;
