const { body } = require("express-validator");

exports.validateRoomCreate = [
  body("room_catalogue_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn nhóm phòng"),
  body("department_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn khoa"),
  body("code").notEmpty().withMessage("Mã phòng không được để trống")
    .custom(async (value, { req }) => {
      const existingRoom = await Room.findOne({ where: { code: value } });
      if (existingRoom) {
        throw new Error("Mã phòng đã tồn tại, vui lòng sử dụng mã phòng khác");
      }
      return true;
    }),
];

exports.validateRoomUpdate = [
  body("room_catalogue_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn nhóm phòng"),
  body("department_id").isInt({ gt: 0 }).withMessage("Bạn cần chọn khoa"),
  body("code").notEmpty().withMessage("Mã phòng không được để trống")
    .custom(async (value, { req }) => {
      const existingRoom = await Room.findOne({ where: { code: value, id: { [Op.ne]: req.params.id } } });
      if (existingRoom) {
        throw new Error("Mã phòng đã tồn tại, vui lòng sử dụng mã phòng khác");
      }
      return true;
    }),
];
