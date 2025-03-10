const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Position extends Model {}

Position.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
  },
  service_catalogue_id: {
    type: DataTypes.BIGINT.UNSIGNED,
  },
  detail: {
    type: DataTypes.TEXT,
  },
  health_insurance_applied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  health_insurance_value: {
    type: DataTypes.DECIMAL(10, 2),
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  room_catalogue_id: {
    type: DataTypes.BIGINT.UNSIGNED,
  },
}, {
  sequelize, // Truyền instance sequelize vào
  modelName: 'Position', // Tên model
  tableName: 'positions', // Tên bảng (nếu không khai báo thì mặc định dùng modelName + 's')
  timestamps: true, // Thêm createdAt, updatedAt
  underscored: true, // Dùng snake_case thay vì camelCase
});

module.exports = Position;
