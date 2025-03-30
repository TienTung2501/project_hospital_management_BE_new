const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Patient = require("./Patient");
const Bill = require("./Bill");

class AdvancePayment extends Model {}

AdvancePayment.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },

    treatment_session_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false }, // Số tiền tạm ứng
    payment_date: { 
      type: DataTypes.DATE, 
      allowNull: false, 
      defaultValue: DataTypes.NOW, // Ngày đóng tiền (mặc định là thời điểm tạo)
    },
  },
  { sequelize, modelName: "AdvancePayment", tableName: "advance_payments", timestamps: true, underscored: true }
);


module.exports = AdvancePayment;
