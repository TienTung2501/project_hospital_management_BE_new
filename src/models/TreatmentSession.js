const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const MedicalRecord = require("./MedicalRecord");
const Bed = require("./Bed");
const AdvancePayment = require("./AdvancePayment");

class TreatmentSession extends Model {}

TreatmentSession.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    medical_record_id: { 
        type: DataTypes.BIGINT.UNSIGNED, 
        allowNull: false, 
        references: { model: MedicalRecord, key: "id" } 
    },
    bed_id: { 
        type: DataTypes.BIGINT.UNSIGNED, 
        allowNull: false, 
        references: { model: Bed, key: "id" } 
    },
    start_date: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    },
    end_date: { type: DataTypes.DATE, allowNull: true },
    diagnosis: { type: DataTypes.TEXT, allowNull: true }, 
    notes: { type: DataTypes.TEXT, allowNull: true }, 
    conclusion_of_treatment: { type: DataTypes.TEXT, allowNull: true }, 
    status: { type: DataTypes.INTEGER, defaultValue: 1 },
    current_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // Tổng chi phí hiện tại sau bảo hiểm
    total_advance_payment: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, // Tổng tiền tạm ứng
    refunded_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, // Tiền hoàn lại
    payment_status:{ type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: "TreatmentSession", tableName: "treatment_sessions", timestamps: true, underscored: true }
);

/**
 * 🏥 Trước khi tạo hoặc cập nhật `TreatmentSession`, tính `current_cost` & `total_advance_payment`
 */
async function calculateCosts(session) {
    const bed = await Bed.findByPk(session.bed_id);
    if (!bed) return;

    const bedPricePerDay = bed.price; // Giá giường mỗi ngày
    const today = new Date();
    const startDate = new Date(session.start_date);
    
    // Tính số ngày nằm viện
    const daysInHospital = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));

    // 📌 Tính bảo hiểm hỗ trợ
    let insuranceDiscount = 0;
    if (bed.health_insurance_applied) {
        insuranceDiscount = (bed.health_insurance_value / 100) * (daysInHospital * bedPricePerDay);
    }

    // 📌 Tính tổng chi phí sau khi trừ bảo hiểm
    session.current_cost = (daysInHospital * bedPricePerDay) - insuranceDiscount;

    // 📌 Tính tổng số tiền tạm ứng từ bảng `AdvancePayment`
    const totalAdvance = await AdvancePayment.sum("amount", {
        where: { treatment_session_id: session.id }
    });

    session.total_advance_payment = totalAdvance || 0;
}

TreatmentSession.beforeCreate(async (session) => {
    await calculateCosts(session);
});

TreatmentSession.beforeUpdate(async (session) => {
    await calculateCosts(session);
});
TreatmentSession.beforeUpdate(async (session) => {
    // Kiểm tra nếu status chuyển thành 0 mà end_date chưa được đặt
    if (session.changed("status") && session.status === 0 && !session.end_date) {
        session.end_date = new Date(); // Gán thời gian hiện tại
    }
    
    // Tính toán lại chi phí & tạm ứng
    await calculateCosts(session);
});


module.exports = TreatmentSession;
