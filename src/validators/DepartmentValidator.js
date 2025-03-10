const { body, validationResult } = require('express-validator');

const validateDepartment = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('status').optional().isInt({ min: 0, max: 1 }).withMessage('Status must be 0 or 1'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 400, errors: errors.array() });
        }
        next();
    }
];

module.exports = validateDepartment;
