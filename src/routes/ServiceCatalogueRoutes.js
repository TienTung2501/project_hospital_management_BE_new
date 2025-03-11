// routes/serviceCatalogueRoutes.js
const express = require("express");
const ServiceCatalogueController = require("../controllers/ServiceCatalogueController");
const validateServiceCatalogue = require("../validators/ServiceCatalogueValidator");

const router = express.Router();

router.get("/", ServiceCatalogueController.index);
router.get("/:id", ServiceCatalogueController.show);
router.post("/create", validateServiceCatalogue, ServiceCatalogueController.create);
router.patch("/:id", validateServiceCatalogue, ServiceCatalogueController.update);
router.delete("/:id", ServiceCatalogueController.remove);

module.exports = router;
