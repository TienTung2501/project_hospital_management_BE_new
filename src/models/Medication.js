const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Medication extends Model {}

Medication.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    medication_catalogue_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    measure_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
    },
    health_insurance_applied: {
      type: DataTypes.TINYINT(1), // ⚠️ Đổi BOOLEAN → TINYINT(1) để tương thích với MySQL
      defaultValue: 0, // false = 0, true = 1
    },
    health_insurance_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "Medication",
    tableName: "medications",
    timestamps: true,
    paranoid: true, // Soft Deletes
    underscored: true,
  }
);

module.exports = Medication;
