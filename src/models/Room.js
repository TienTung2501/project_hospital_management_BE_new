const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Room extends Model {}

Room.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    room_catalogue_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    status_bed: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0: Chưa đầy, 1: Đầy
    },
    occupied_beds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    
    total_beds: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // Tổng số giường trong phòng
    },
  },
  {
    sequelize,
    modelName: "Room",
    tableName: "rooms",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Room;
