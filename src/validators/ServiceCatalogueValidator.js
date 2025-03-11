// middlewares/validateServiceCatalogue.js
const { body, validationResult } = require("express-validator");

const validateServiceCatalogue = [
    body("name").notEmpty().withMessage("Tên nhóm dịch vụ không được để trống"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateServiceCatalogue;
