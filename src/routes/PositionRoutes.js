const express = require('express');
const router = express.Router();
const { index, show, create, update, remove } = require('../controllers/PositionController');
const { validatePosition } = require('../validators/PositionValidator');

router.get('/', index);
router.get('/:id', show);
router.post('/create', validatePosition, create);
router.patch('/:id', validatePosition, update);
router.delete('/:id', remove);

module.exports = router;
