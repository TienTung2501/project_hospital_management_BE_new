const { body } = require("express-validator");

exports.storeMedicationCatalogueValidator = [
  body("name").notEmpty().withMessage("Tên nhóm dược không được để trống"),
];
