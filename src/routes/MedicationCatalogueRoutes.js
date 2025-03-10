const express = require('express');
const router = express.Router();
const MedicationCatalogueController = require('../controllers/MedicationCatalogueController');

router.get('/', MedicationCatalogueController.index);
router.get('/:id', MedicationCatalogueController.show);
router.post('/', MedicationCatalogueController.create);
router.patch('/:id', MedicationCatalogueController.update);
router.delete('/:id', MedicationCatalogueController.delete);

module.exports = router;
