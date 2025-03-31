const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TreatmentSession = require('./TreatmentSession');

const MedicalOrder = sequelize.define('MedicalOrder', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    treatment_session_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, references: { model: TreatmentSession, key: 'id' } },
    detail: { type: DataTypes.TEXT, allowNull: true }, // JSON chứa chi tiết y lệnh
    notes: { type: DataTypes.TEXT, allowNull: true },
}, { sequelize, modelName: 'MedicalOrder', tableName: 'medical_orders', timestamps: true,underscored:true });



module.exports = MedicalOrder;
