const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Permission extends Model {}

Permission.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    keyword: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  {
    sequelize,
    tableName: "permissions",
    timestamps: true,
    underscored:true,
  }
);

module.exports = Permission;
