const express = require('express');
const bedController = require('../controllers/BedController');
const { storeBedValidator,updateBedValidator } = require('../validators/BedValidator');


const router = express.Router();

router.get('/', bedController.index);
router.get('/:id', bedController.show);
router.post('/create', storeBedValidator, bedController.create);
router.patch('/:id', updateBedValidator, bedController.update);
router.delete('/:id', bedController.remove);

module.exports = router;
