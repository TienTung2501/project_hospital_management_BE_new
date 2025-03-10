const { body } = require("express-validator");
const Permission = require("../models/Permission");

exports.storePermissionValidator = [
  body("name").notEmpty().withMessage("Tên quyền không được để trống"),
  body("keyword")
    .notEmpty()
    .withMessage("Từ khóa không được để trống")
    .custom(async (value) => {
      const existing = await Permission.findOne({ where: { keyword: value } });
      if (existing) {
        throw new Error("Từ khóa đã tồn tại, vui lòng sử dụng từ khóa khác");
      }
    }),
];

exports.updatePermissionValidator = [
  body("name").notEmpty().withMessage("Tên quyền không được để trống"),
  body("keyword").notEmpty().withMessage("Từ khóa không được để trống"),
];
