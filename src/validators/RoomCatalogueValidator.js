const { body } = require("express-validator");
const RoomCatalogue = require("../models/RoomCatalogue");

exports.storeRoomCatalogueValidator = [
  body("name").notEmpty().withMessage("Tên nhóm phòng không được để trống"),
  body("keyword")
    .notEmpty()
    .withMessage("Từ khóa không được để trống")
    .custom(async (value) => {
      const existing = await RoomCatalogue.findOne({ where: { keyword: value } });
      if (existing) {
        throw new Error("Từ khóa đã tồn tại, vui lòng sử dụng từ khóa khác");
      }
    }),
];

exports.updateRoomCatalogueValidator = [
  body("name").notEmpty().withMessage("Tên nhóm phòng không được để trống"),
  body("keyword").notEmpty().withMessage("Từ khóa không được để trống"),
];
