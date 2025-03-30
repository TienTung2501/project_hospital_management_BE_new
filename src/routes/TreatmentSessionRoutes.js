const express = require('express');
const TreatmentSessionController = require('../controllers/TreatmentSessionController');

const router = express.Router();
router.get('/', TreatmentSessionController.index);//ok
router.post('/create', TreatmentSessionController.create);
router.post('/save', TreatmentSessionController.save);
router.post('/createPivot', TreatmentSessionController.createPivot);
router.get('/list', TreatmentSessionController.getPatientWaitTest);//ok
router.get('/waitDiagnosis', TreatmentSessionController.getPatientWaitDiagnosis);//ok

module.exports = router;
