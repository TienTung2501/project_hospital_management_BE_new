const express = require('express');
const MedicalRecordController = require('../controllers/MedicalRecordController');

const router = express.Router();

router.get('/', MedicalRecordController.index);
router.post('/create', MedicalRecordController.create);
router.post('/save', MedicalRecordController.save);
router.post('/createPivot', MedicalRecordController.createPivot);
router.get('/list', MedicalRecordController.getPatientWaitTest);
router.get('/waitDiagnosis', MedicalRecordController.getPatientWaitDiagnosis);

module.exports = router;
