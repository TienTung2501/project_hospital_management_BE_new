const express = require('express');
const MedicalRecordController = require('../controllers/MedicalRecordController');

const router = express.Router();
router.get('/', MedicalRecordController.index);//ok
router.get('/showAdvance', MedicalRecordController.showAdvance);//ok
router.post('/create', MedicalRecordController.create);
router.post('/save', MedicalRecordController.save);
router.post('/createPivot', MedicalRecordController.createPivot);
router.post('/createPivotTreatmentSession', MedicalRecordController.createPivotTreatmentSession);
router.get('/list', MedicalRecordController.getPatientWaitTest);//ok
router.get('/waitDiagnosis', MedicalRecordController.getPatientWaitDiagnosis);//ok

module.exports = router;
