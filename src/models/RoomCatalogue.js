const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");


class RoomCatalogue extends Model {}

RoomCatalogue.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    keyword: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
  },
  {
    sequelize,
    tableName: "room_catalogues",
    timestamps: true,
    underscored: true, // Dùng snake_case thay vì camelCase
  }
);

module.exports = RoomCatalogue;
