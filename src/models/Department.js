const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Department extends Model {}

Department.init(
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        status: { type: DataTypes.TINYINT, defaultValue: 1 },
    },
    {
        sequelize,
        modelName: 'Department',
        tableName: 'departments',
        timestamps: true, // Bật timestamps để Sequelize tự động quản lý createdAt, updatedAt
        underscored: true, // Dùng snake_case thay vì camelCase
    }
);

module.exports = Department;
