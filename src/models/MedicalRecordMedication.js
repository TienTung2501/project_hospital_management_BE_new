const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MedicalRecordMedication extends Model {}

MedicalRecordMedication.init(
  {
    medical_record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: MedicalRecord,
          key: "id"
        }
      },
      medication_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Medication,
          key: "id"
        }
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
      }
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
