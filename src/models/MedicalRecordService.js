const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MedicalRecordService extends Model {}

MedicalRecordService.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    service_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    room_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    medical_record_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    service_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    result_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MedicalRecordService",
    tableName: "medical_record_services",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MedicalRecordService;
