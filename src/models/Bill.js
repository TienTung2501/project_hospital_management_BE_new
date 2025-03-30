const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const TreatmentSession = require("./TreatmentSession");
const MedicalRecordService = require("./MedicalRecordService"); // Import model MedicalRecordService

class Bill extends Model {}

Bill.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    treatment_session_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true, // Có thể null vì bệnh nhân ngoại trú
    },
    bill_type: { 
      type: DataTypes.ENUM("beds", "services",  "medications"),
      allowNull: false 
    }, // Loại hóa đơn
    pivot_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },// có thể true vì giường có thể không có pivot. Dùng để liên kết với service
    total_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // Tổng chi phí
    total_insurance_covered: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Bảo hiểm chi trả
    total_paid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Số tiền đã thanh toán
    total_amount_due: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Số tiền còn nợ
    refunded_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Tiền hoàn lại nếu đóng dư
    status: { type: DataTypes.TINYINT, defaultValue: 0 }, // 0: Chưa thanh toán, 1: Đã thanh toán
  },
  { sequelize, modelName: "Bill", tableName: "bills", timestamps: true, underscored: true }
);

/**
 * 🏥 Trước khi tạo hoặc cập nhật `Bill`, tính tổng tiền theo loại hóa đơn
 */
async function calculateBillAmounts(bill) {
    let totalPrice = 0;
    let totalInsuranceCovered = 0;
    let totalPaid = 0;
    let totalAmountDue = 0;
    let refundedAmount = 0;

    // 📌 Nếu là hóa đơn viện phí (hospital_fee), lấy dữ liệu từ `TreatmentSession`
    if (bill.bill_type === "beds" && bill.treatment_session_id) {
        const session = await TreatmentSession.findByPk(bill.treatment_session_id);
        if (!session) return;

        totalPrice = parseFloat(session.current_cost);
        totalPaid = parseFloat(session.total_advance_payment);
        totalInsuranceCovered = 0; // Nếu có bảo hiểm thì tính sau

        // 📌 Nếu bệnh nhân đã đóng nhiều hơn tổng viện phí, hoàn tiền dư
        if (totalPaid > totalPrice) {
            refundedAmount = totalPaid - totalPrice;
            totalAmountDue = 0;
        } else {
            totalAmountDue = totalPrice - totalPaid;
        }
    } else {
        // 📌 Xử lý các loại hóa đơn khác từ BillDetail
        const billDetails = await BillDetail.findAll({ where: { bill_id: bill.id } });

        for (const detail of billDetails) {
            totalPrice += parseFloat(detail.total_price);
            totalInsuranceCovered += parseFloat(detail.total_insurance_covered);
        }

        totalAmountDue = totalPrice - totalInsuranceCovered;
    }

    // 📌 Cập nhật vào `Bill`
    bill.total_price = totalPrice;
    bill.total_insurance_covered = totalInsuranceCovered;
    bill.total_paid = totalPaid;
    bill.total_amount_due = totalAmountDue;
    bill.refunded_amount = refundedAmount;
}
// 📌 Hook tự động tính toán khi tạo/sửa hóa đơn
Bill.beforeCreate(async (bill) => {
    await calculateBillAmounts(bill);
});

Bill.beforeUpdate(async (bill) => {
    await calculateBillAmounts(bill);
});
Bill.afterUpdate(async (bill, options) => {
    // 🏥 Nếu hóa đơn đã được thanh toán (status = 1)
    if (bill.status === 1) {
        // 📌 Nếu hóa đơn thuộc loại dịch vụ (services) và có pivot_id
        if (bill.bill_type === "services" && bill.pivot_id) {
            await MedicalRecordService.update(
                { payment_status: 1 }, // Đánh dấu đã thanh toán
                { where: { id: bill.pivot_id } } // Cập nhật theo pivot_id
            );
            console.log(`✅ Đã cập nhật payment_status cho MedicalRecordService ID: ${bill.pivot_id}`);
        }

        // 📌 Nếu hóa đơn thuộc loại "beds", cập nhật payment_status trong TreatmentSession
        if (bill.bill_type === "beds" && bill.treatment_session_id) {
            const session = await TreatmentSession.findByPk(bill.treatment_session_id);
            if (!session) return;
            
            await session.update({
                payment_status: 1, // Đã thanh toán
                refunded_amount: bill.refunded_amount,
            });
            console.log(`✅ Đã cập nhật payment_status cho TreatmentSession ID: ${bill.treatment_session_id}`);
        }
    }
});


module.exports = Bill;
