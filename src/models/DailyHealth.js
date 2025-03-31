const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TreatmentSession = require('./TreatmentSession');

const DailyHealth = sequelize.define('DailyHealth', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    treatment_session_id: { 
        type: DataTypes.BIGINT.UNSIGNED, 
        allowNull: false, 
    },
    check_date: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    }, // Thời gian kiểm tra
    temperature: { type: DataTypes.FLOAT, defaultValue: 37 }, // Nhiệt độ cơ thể
    blood_pressure: { type: DataTypes.STRING(10), allowNull: false }, // Huyết áp (vd: 120/80)
    heart_rate: { type: DataTypes.INTEGER, allowNull: false }, // Nhịp tim (số nhịp mỗi phút)
    notes: { type: DataTypes.TEXT, allowNull: true }, // Các triệu chứng hoặc ghi chú
}, 
{ sequelize, modelName: 'DailyHealth', tableName: 'daily_healths', timestamps: true,underscored:true }
);

DailyHealth.belongsTo(TreatmentSession, { foreignKey: 'treatment_session_id' });

module.exports = DailyHealth;
