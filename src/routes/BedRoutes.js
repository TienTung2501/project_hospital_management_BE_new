const express = require('express');
const bedController = require('../controllers/BedController');
const { storeBedValidator,updateBedValidator } = require('../validators/BedValidator');


const router = express.Router();

router.get('/', bedController.index);
router.get('/:id', bedController.show);
router.post('/', storeBedValidator, bedController.create);
router.put('/:id', updateBedValidator, bedController.update);
router.delete('/:id', bedController.delete);

module.exports = router;
