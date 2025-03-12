const express = require("express");
const router = express.Router();
const MedicationController = require("../controllers/MedicationController");
const { storeMedicationValidator } = require("../validators/medicationValidator");

router.get("/", MedicationController.index);
router.get("/:id", MedicationController.show);
router.post("/create", storeMedicationValidator, MedicationController.create);
router.patch("/:id", storeMedicationValidator, MedicationController.update);
router.delete("/:id", MedicationController.remove);

module.exports = router;
