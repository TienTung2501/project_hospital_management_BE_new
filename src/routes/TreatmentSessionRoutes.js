const express = require('express');
const TreatmentSessionController = require('../controllers/TreatmentSessionController');

const router = express.Router();
// router.get('/', TreatmentSessionController.index);//ok
router.post('/save', TreatmentSessionController.save);
router.post('/createPivotAdvancePayment', TreatmentSessionController.createPivotAdvancePayment);
router.post('/createPivotMedicalOrder', TreatmentSessionController.createPivotMedicalOrder);//ok
router.post('/createPivotDailyHealth', TreatmentSessionController.createPivotDailyHealth);//ok

module.exports = router;
