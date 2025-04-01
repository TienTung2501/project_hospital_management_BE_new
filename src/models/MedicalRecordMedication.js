const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MedicalRecordMedication extends Model {}

MedicalRecordMedication.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    bill_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    medical_record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      medication_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dosage: {
        type: DataTypes.STRING,
        allowNull: false
      },
      measure: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      payment_status:{ type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "MedicalRecordMedication",
    tableName: "medical_record_medication",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MedicalRecordMedication;
