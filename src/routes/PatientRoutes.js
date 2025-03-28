const express = require("express");
const router = express.Router();
const patientController = require("../controllers/PatientController");
const { validatePatient } = require("../validators/PatientValidator");

router.get("/", patientController.index);
router.get("/:id/history", patientController.getHistory);
router.get("/:id", patientController.show);
router.post("/create", validatePatient,  patientController.create);
router.patch("/:id", validatePatient,  patientController.update);
router.delete("/:id", patientController.remove);

module.exports = router;
