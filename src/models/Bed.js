const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
class Bed extends Model {}

Bed.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    room_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "rooms",
        key: "id",
      },
    },
    patient_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "patients",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Bed",
    tableName: "beds",
    timestamps: true,
    underscored:true,
  }
);



module.exports = Bed;
