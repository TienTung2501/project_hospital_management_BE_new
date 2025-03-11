const { body, validationResult } = require('express-validator');

const validateDepartment = [
    body('name').notEmpty().withMessage('Name is required'),
];

module.exports = validateDepartment;
