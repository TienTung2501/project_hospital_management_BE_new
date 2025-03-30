const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Bill = require("./Bill");
const Service = require("./Service");
const Medication = require("./Medication");
const Bed = require("./Bed");
const Patient = require("./Patient");
const AdvancePayment = require("./AdvancePayment");

class BillDetail extends Model {}

BillDetail.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    bill_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    model_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    model_type: { 
      type: DataTypes.ENUM("beds", "services",  "medications"),
      allowNull: false 
    }, // Loại dịch vụ
    model_name: { type: DataTypes.STRING(255), allowNull: false },
    unit: { type: DataTypes.STRING(50), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Đơn giá
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_insurance_covered: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total_amount_due: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Số tiền bệnh nhân cần trả sau khi trừ BHYT
    health_insurance_applied: { type: DataTypes.TINYINT, defaultValue: 0 }, // 1: Có BHYT, 0: Không có
    health_insurance_value: { type: DataTypes.FLOAT, defaultValue: 0 }, // % BHYT chi trả
  },
  { sequelize, modelName: "BillDetail", tableName: "bill_details", timestamps: true, underscored: true }
);

/**
 * 🏥 Trước khi tạo BillDetail, tự động tính tổng tiền & áp dụng bảo hiểm y tế
 */
BillDetail.beforeCreate(async (billDetail) => {
  let modelData = null;

  // 📌 Xác định bảng cần truy vấn
  if (billDetail.model_type === "services") {
    modelData = await Service.findByPk(billDetail.model_id);
  } else if (billDetail.model_type === "medications") {
    modelData = await Medication.findByPk(billDetail.model_id);
  } else if (billDetail.model_type === "beds") {
    modelData = await Bed.findByPk(billDetail.model_id);
  }

  if (!modelData) {
    throw new Error("Model không tồn tại!");
  }

  // 📌 Điền thông tin từ model tương ứng
  billDetail.model_name = modelData.name;
  billDetail.unit = modelData.unit || "lần"; // Đơn vị mặc định nếu không có
  billDetail.price = modelData.price;
  billDetail.health_insurance_applied = modelData.health_insurance_applied || 0;
  billDetail.health_insurance_value = modelData.health_insurance_value || 0;

  // 📌 Lấy thông tin bệnh nhân từ hóa đơn
  const bill = await Bill.findByPk(billDetail.bill_id, { include: [{ model: Patient }] });

  if (bill && bill.Patient) {
    const patient = bill.Patient;
    if (patient.health_insurance_code) {
      billDetail.health_insurance_applied = 1;
    }
  }

  // 📌 Tính toán tổng tiền & bảo hiểm
  const insuranceDiscount = billDetail.health_insurance_applied
    ? billDetail.health_insurance_value / 100
    : 0;

  billDetail.total_price = billDetail.quantity * billDetail.price;
  billDetail.total_insurance_covered = billDetail.total_price * insuranceDiscount;
  billDetail.total_amount_due = billDetail.total_price - billDetail.total_insurance_covered;
});

// tạo hóa đơn cho các dịch vụ-> truyền vào id dịch vụ loại dịch vụ quantity là tự động fill các trường còn lại theo các thông tin lấy từ model được ko
module.exports = BillDetail;
// khi tạo dịch vụ, kết thúc đợt điều trị, hoặc thêm thuốc chỉ cần truyền vào các trường sau là oke.
// {
//   "bill_id": 1,
//   "model_id": 3,
//   "model_type": "services",
//   "quantity": 2
// }