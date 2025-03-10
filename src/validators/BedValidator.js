const { body, param } = require('express-validator');

exports.storeBedValidator = [
    body('code').notEmpty().withMessage('Mã giường không được để trống')
                .isString().withMessage('Mã giường phải là chuỗi'),
    body('room_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn phòng')
];


exports.updateBedValidator = [
    param('id').isInt().withMessage('ID không hợp lệ'),
    body('code').notEmpty().withMessage('Mã giường không được để trống')
                .isString().withMessage('Mã giường phải là chuỗi'),
    body('room_id').isInt({ gt: 0 }).withMessage('Bạn cần chọn phòng')
];
