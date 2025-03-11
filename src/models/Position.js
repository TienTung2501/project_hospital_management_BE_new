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
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  sequelize, // Truyền instance sequelize vào
  modelName: 'Position', // Tên model
  tableName: 'positions', // Tên bảng (nếu không khai báo thì mặc định dùng modelName + 's')
  timestamps: true, // Thêm createdAt, updatedAt
  underscored: true, // Dùng snake_case thay vì camelCase
});

module.exports = Position;
