const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MedicalRecordServiceModel extends Model {}

MedicalRecordServiceModel.init(
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
    bill_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
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
    quantity:{
      type:DataTypes.INTEGER,
      defaultValue:1
    },
    result_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payment_status:{ type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "MedicalRecordService",
    tableName: "medical_record_service",
    timestamps: true,
    underscored: true,
  }
);
module.exports = MedicalRecordServiceModel;
