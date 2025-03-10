const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class MedicalRecord extends Model {}

MedicalRecord.init(
    {
        id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
        patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
        user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        room_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
        visit_date: { type: DataTypes.DATE, allowNull: false },
        diagnosis: { type: DataTypes.TEXT, allowNull: true },
        notes: { type: DataTypes.TEXT, allowNull: true },
        appointment_date: { type: DataTypes.DATE, allowNull: true },
        is_inpatient: { type: DataTypes.BOOLEAN, defaultValue: false },
        inpatient_detail: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    { sequelize, modelName: 'MedicalRecord', tableName: 'medical_records', timestamps: true,underscored:true }
);

module.exports = MedicalRecord;
