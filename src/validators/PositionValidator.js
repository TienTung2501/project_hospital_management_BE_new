const { body } = require('express-validator');

const validatePosition = [
    body('name').notEmpty().withMessage('Name is required'),
];

module.exports = { validatePosition };
