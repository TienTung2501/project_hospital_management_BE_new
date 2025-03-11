// middlewares/validateService.js
const { body, validationResult } = require("express-validator");

const validateService = [
    body("name").notEmpty().withMessage("Tên dịch vụ không được để trống"),
    body("price").notEmpty().withMessage("Giá dịch vụ không được để trống"),
    body("service_catalogue_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn nhóm dịch vụ"),
    body("room_catalogue_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn nhóm phòng cho dịch vụ"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateService;
