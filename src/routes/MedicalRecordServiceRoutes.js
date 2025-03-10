const express = require('express');
const MedicalRecordServiceController = require('../controllers/MedicalRecordServiceController');

const router = express.Router();

router.post('/update', MedicalRecordServiceController.update);

module.exports = router;
