const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Patient extends Model {}

Patient.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cccd_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    health_insurance_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guardian_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patients",
    timestamps: true,
    underscored:true,
  }
);

module.exports = Patient;
