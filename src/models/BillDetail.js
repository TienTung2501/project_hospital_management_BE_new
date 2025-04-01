const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const { models } = require("../config/database");
const Service = require("./Service");
const Medication = require("./Medication");
const Bed = require("./Bed");
const Patient = require("./Patient");

class BillDetail extends Model {}

BillDetail.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    bill_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    model_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    model_type: { type: DataTypes.ENUM("beds", "services", "medications"), allowNull: false },
    model_name: { type: DataTypes.STRING(255), allowNull: true },
    unit: { type: DataTypes.STRING(50), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total_insurance_covered: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    total_amount_due: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    health_insurance_applied: { type: DataTypes.TINYINT, defaultValue: 0 },
    health_insurance_value: { type: DataTypes.FLOAT, defaultValue: 0 },
  },
  { sequelize, modelName: "BillDetail", tableName: "bill_details", timestamps: true, underscored: true }
);

// 🏥 Trước khi tạo BillDetail, tự động điền thông tin & tính toán giá trị
BillDetail.beforeCreate(async (billDetail) => {
  let modelData = null;

  if (billDetail.model_type === "services") {
    modelData = await Service.findByPk(billDetail.model_id);
  } else if (billDetail.model_type === "medications") {
    modelData = await Medication.findByPk(billDetail.model_id);
  } else if (billDetail.model_type === "beds") {
    modelData = await Bed.findByPk(billDetail.model_id);
  }

  if (!modelData) throw new Error("Model không tồn tại!");

  billDetail.model_name = modelData.name||"Bed";
  billDetail.unit = modelData.unit || "Lần";
  billDetail.price = modelData.price;
  billDetail.health_insurance_applied = modelData.health_insurance_applied || 0;
  billDetail.health_insurance_value = modelData.health_insurance_value || 0;

  const insuranceDiscount = billDetail.health_insurance_applied ? billDetail.health_insurance_value / 100 : 0;

  billDetail.total_price = billDetail.quantity * billDetail.price;
  billDetail.total_insurance_covered = billDetail.total_price * insuranceDiscount;
  billDetail.total_amount_due = billDetail.total_price - billDetail.total_insurance_covered;
});

// 📌 Hàm cập nhật lại hóa đơn khi BillDetail thay đổi

module.exports = BillDetail;
