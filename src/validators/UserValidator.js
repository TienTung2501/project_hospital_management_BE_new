const { body, validationResult } = require('express-validator');

const validateUser = [
    body('name').notEmpty().withMessage('Tên nhân viên không được để trống'),
    body('cccd').notEmpty().withMessage('Số căn cước công dân của nhân viên không được để trống'),
    body('email')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không đúng định dạng'),
    body('password')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6, max: 12 }).withMessage('Mật khẩu phải có từ 6 đến 12 kí tự'),
    body('position_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn chức danh cho nhân viên'),
    body('department_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn khoa cho nhân viên'),
    body('gender').notEmpty().withMessage('Bạn cần chọn giới tính'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserUpdate = [
    body('name').notEmpty().withMessage('Tên nhân viên không được để trống'),
    body('cccd').notEmpty().withMessage('Số căn cước công dân của nhân viên không được để trống'),
    body('email')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không đúng định dạng'),
    body('position_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn chức danh cho nhân viên'),
    body('department_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn khoa cho nhân viên'),
    body('address').notEmpty().withMessage('Địa chỉ không được để trống'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = { validateUser, validateUserUpdate };
