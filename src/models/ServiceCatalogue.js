const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class ServiceCatalogue extends Model {}

ServiceCatalogue.init(
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
      defaultValue: 1,
    },
  },
  {
    sequelize,
    modelName: "ServiceCatalogue",
    tableName: "service_catalogues",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ServiceCatalogue;
