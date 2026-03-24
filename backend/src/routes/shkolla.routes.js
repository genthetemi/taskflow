const express = require("express");
const router = express.Router();
const shkollaController = require("../controllers/shkolla.controller");

router.post("/", shkollaController.createShkolla);

router.get("/", shkollaController.getAllShkolla);

router.get("/:id", shkollaController.getShkollaById);

router.put("/:id", shkollaController.updateShkolla);

router.delete("/:id", shkollaController.deleteShkolla);

module.exports = router;