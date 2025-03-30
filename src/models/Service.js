const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Service extends Model {}

Service.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      defaultValue: "Lần",
    },
    service_catalogue_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    status: {
      type: DataTypes.TINYINT(1),
      defaultValue: 1,
    },
    room_catalogue_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Service",
    tableName: "services",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Service;
