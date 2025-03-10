const { body } = require("express-validator");

exports.storeMedicationValidator = [
  body("name").notEmpty().withMessage("Tên dược không được để trống"),
  body("medication_catalogue_id")
    .isInt({ gt: 0 })
    .withMessage("Bạn cần chọn nhóm dược"),
  body("price").notEmpty().withMessage("Giá tiền không được để trống"),
  body("measure").notEmpty().withMessage("Đơn vị không được để trống"),
  body("measure_count").notEmpty().withMessage("Số lượng dược theo đơn vị không được để trống"),
];
