const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class MedicationCatalogue extends Model {}

MedicationCatalogue.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    lft: {
      type: DataTypes.INTEGER,
      allowNull: false, // Không cho phép NULL
      defaultValue: 0, // Giá trị mặc định
    },
    rgt: {
      type: DataTypes.INTEGER,
      allowNull: false, // Không cho phép NULL
      defaultValue: 0, // Giá trị mặc định
    },
  },
  {
    sequelize,
    modelName: "MedicationCatalogue",
    tableName: "medication_catalogues",
    timestamps: true,
    underscored: true,
    paranoid: true, // Soft Deletes (tương tự Laravel `SoftDeletes`)
  }
);

module.exports = MedicationCatalogue;
