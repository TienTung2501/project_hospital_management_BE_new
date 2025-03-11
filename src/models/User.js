const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cccd: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  position_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  department_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  }
}, {
  sequelize,  // Truyền instance sequelize vào
  modelName: 'User',  // Tên model
  tableName: 'users',  // Tên bảng trong DB
  timestamps: true,  // Bật createdAt & updatedAt
  underscored: true, // Dùng snake_case thay vì camelCase
});

module.exports = User;
