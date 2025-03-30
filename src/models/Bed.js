const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("./Room"); // Import model Room

class Bed extends Model {}

Bed.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: "Ngày",
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0: Chưa có bệnh nhân, 1: Đã có bệnh nhân
    },
    room_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
    },
    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "patients",
        key: "id",
      },
    },
    health_insurance_applied: {
      type: DataTypes.TINYINT(1), // ⚠️ Đổi BOOLEAN → TINYINT(1) để tương thích với MySQL
      defaultValue: 0, // false = 0, true = 1
    },
    health_insurance_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "Bed",
    tableName: "beds",
    timestamps: true,
    underscored: true,
  }
);

// 🔥 Hàm cập nhật trạng thái giường trong phòng
async function updateRoomStatus(roomId) {
  const totalBeds = await Bed.count({ where: { room_id: roomId } });
  const occupiedBeds = await Bed.count({ where: { room_id: roomId, status: 1 } });

  await Room.update(
    {
      total_beds: totalBeds,
      occupied_beds: occupiedBeds, // Cập nhật số giường đang có bệnh nhân
      status_bed: occupiedBeds === totalBeds ? 1 : 0, // Nếu tất cả giường đã có bệnh nhân -> Đánh dấu phòng đầy
    },
    { where: { id: roomId } }
  );
}

// 🛠 Hooks cập nhật phòng mỗi khi giường thay đổi
Bed.afterCreate(async (bed) => {
  await updateRoomStatus(bed.room_id);
});

Bed.afterDestroy(async (bed) => {
  await updateRoomStatus(bed.room_id);
});

Bed.afterUpdate(async (bed) => {
  await updateRoomStatus(bed.room_id);
});

module.exports = Bed;
// 🛠 Cơ chế cập nhật tự động
// Mình dùng Sequelize Hooks để tự động cập nhật khi có thay đổi trong beds:

// afterCreate: Khi tạo giường mới, cập nhật lại số giường trong phòng.

// afterDestroy: Khi xóa giường, cập nhật lại số giường trong phòng.

// afterUpdate: Khi giường thay đổi trạng thái (status), kiểm tra xem phòng có đầy chưa.

// 🔥 Chi tiết từng bước
// Mỗi khi có sự thay đổi ở beds, hệ thống sẽ:

// Đếm số giường trong phòng (total_bed)

// Dùng Bed.count({ where: { room_id } }) để lấy tổng số giường của phòng.

// Đếm số giường có bệnh nhân (occupiedBeds)

// Dùng Bed.count({ where: { room_id, status: 1 } }) để lấy số giường đã có bệnh nhân.

// Cập nhật rooms:

// total_bed = tổng số giường trong phòng.

// status_bed = 1 nếu tất cả giường đã có bệnh nhân, ngược lại status_bed = 0.