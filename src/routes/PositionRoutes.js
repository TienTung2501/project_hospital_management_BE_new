const express = require('express');
const router = express.Router();
const PositionController = require('../controllers/PositionController');
const { validatePosition } = require('../validators/PositionValidator');

router.get('/', PositionController.index);
router.get('/:id', PositionController.show);
router.post('/', validatePosition, PositionController.create);
router.patch('/:id', validatePosition, PositionController.update);
router.delete('/:id', PositionController.delete);

module.exports = router;
