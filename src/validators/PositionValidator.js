const { body } = require('express-validator');

const validatePosition = [
  body('name').notEmpty().withMessage('Tên chức danh không được để trống'),
];

module.exports = { validatePosition };
