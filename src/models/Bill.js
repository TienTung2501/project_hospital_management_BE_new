const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const TreatmentSession = require("./TreatmentSession");
const BillDetail = require("./BillDetail");
const MedicalRecordService = require("./MedicalRecordService");
const MedicalRecordMedication = require("./MedicalRecordMedication");

class Bill extends Model {
  static async updateBill(billId, transaction) {
    const bill = await Bill.findByPk(billId, { transaction });
  
    if (!bill) {
      console.log(`❌ Không tìm thấy hóa đơn với ID ${billId}`);
      return;
    }
  
    const billDetails = await BillDetail.findAll({ where: { bill_id: billId }, transaction });
  
    let totalPrice = 0;
    let totalInsuranceCovered = 0;
  
    for (const detail of billDetails) {
      totalPrice += parseFloat(detail.total_price);
      totalInsuranceCovered += parseFloat(detail.total_insurance_covered);
    }
  
    bill.total_price = totalPrice;
    bill.total_insurance_covered = totalInsuranceCovered;
    bill.total_amount_due = totalPrice - totalInsuranceCovered;

    // Cập nhật trường amount_due
    if (bill.bill_type === "beds" && bill.treatment_session_id) {
      const session = await TreatmentSession.findByPk(bill.treatment_session_id);
      if (session&&session.total_advance_payment-bill.total_amount_due>0) {
        bill.total_paid = session.total_advance_payment; // Số tiền đã ứng
        bill.refunded_amount = session.total_advance_payment-session.current_cost>=0?session.total_advance_payment-bill.total_amount_due:0; // Số tiền đã hoàn lại
        bill.amount_due = session.current_cost - session.total_advance_payment>=0?session.current_cost - session.total_advance_payment:0; // Số tiền cần thanh toán
      }
    }

    // Đối với services và medications, total_paid = 0, refunded_amount = 0 khi hóa đơn tạo
    if (bill.bill_type === "services" || bill.bill_type === "medications") {
      bill.total_paid = 0;
      bill.refunded_amount = 0;
      bill.amount_due = bill.total_amount_due; // Số tiền cần thanh toán bằng total_amount_due
    }

    await bill.save({ transaction });
  }
}

Bill.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    treatment_session_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    patient_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    bill_type: { type: DataTypes.ENUM("beds", "services", "medications"), allowNull: false },
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 },
    total_insurance_covered: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total_amount_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    refunded_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    amount_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },  // Thêm trường cần thanh toán
    status: { type: DataTypes.TINYINT, defaultValue: 0 },
  },
  { sequelize, modelName: "Bill", tableName: "bills", timestamps: true, underscored: true }
);

Bill.afterUpdate(async (bill, options) => {

  // Kiểm tra nếu status là 1
  if (bill.status === 1) {
      // Kiểm tra loại bill và thực hiện cập nhật tương ứng
    if (bill.bill_type === "services") {
      const updatedServices = await MedicalRecordService.update(
        { payment_status: 1 },
        { where: { bill_id: bill.id } }
      );
    }

    if (bill.bill_type === "medications") {
      const updatedMedications = await MedicalRecordMedication.update(
        { payment_status: 1 },
        { where: { bill_id: bill.id } }
      );
    }

    if (bill.bill_type === "beds" && bill.treatment_session_id) {
      const session = await TreatmentSession.findByPk(bill.treatment_session_id);
      if (session) {
        await session.update({ payment_status: 1, refunded_amount: bill.refunded_amount });
      }
    }
  }
});




module.exports = Bill;
