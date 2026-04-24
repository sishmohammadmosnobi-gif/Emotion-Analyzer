const express = require("express");
const Scan = require("../models/Scan");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const scan = await Scan.create({
    userId: req.user.id,
    emotions: req.body.emotions,
    dominantEmotion: req.body.dominantEmotion,
    imageType: req.body.imageType,
  });
  res.json(scan);
});

router.get("/", auth, async (req, res) => {
  const scans = await Scan.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
  res.json(scans);
});

module.exports = router;