const { body } = require("express-validator");

exports.validatePatient = [
  body("name").notEmpty().withMessage("Tên bệnh nhân không được để trống"),
  body("cccd_number")
    .notEmpty()
    .withMessage("Số căn cước công dân không được để trống"),
  body("birthday").notEmpty().withMessage("Ngày sinh không được để trống"),
  body("address").notEmpty().withMessage("Địa chỉ không được để trống"),
];
