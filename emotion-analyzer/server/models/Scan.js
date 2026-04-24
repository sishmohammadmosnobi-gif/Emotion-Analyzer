const mongoose = require("mongoose");
const ScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emotions: { type: Array },
  dominantEmotion: { type: String },
  imageType: { type: String, enum: ["upload", "webcam"] },
}, { timestamps: true });
module.exports = mongoose.model("Scan", ScanSchema);