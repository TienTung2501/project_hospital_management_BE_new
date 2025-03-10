// routes/serviceRoutes.js
const express = require("express");
const ServiceController = require("../controllers/ServiceController");
const validateService = require("../validators/ServiceValidator");

const router = express.Router();

router.get("/", ServiceController.index);
router.get("/:id", ServiceController.show);
router.post("/", validateService, ServiceController.create);
router.patch("/:id", validateService, ServiceController.update);
router.delete("/:id", ServiceController.delete);

module.exports = router;
