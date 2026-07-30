const express = require("express");
const {
  getSettings,
  updateSettings,
  resetSettings,
} = require("../controllers/admin/systemSettings.controller");

const systemsettingsrouter = express.Router();

// GET settings
systemsettingsrouter.get("/", getSettings);

// UPDATE settings
systemsettingsrouter.put("/update", updateSettings);

// RESET settings
systemsettingsrouter.delete("/reset", resetSettings);

module.exports = systemsettingsrouter;