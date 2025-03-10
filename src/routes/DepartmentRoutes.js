const express = require('express');
const { index, show, create, update, remove } = require('../controllers/DepartmentController');
const validateDepartment = require('../validators/DepartmentValidator');

const router = express.Router();
router.get('/', index);
router.get('/:id', show);
router.post('/', validateDepartment, create);
router.patch('/:id', validateDepartment, update);
router.delete('/:id', remove);

module.exports = router;
