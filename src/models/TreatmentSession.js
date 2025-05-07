const { DataTypes, Model, Op } = require("sequelize");
const sequelize = require("../config/database");
const MedicalRecord = require("./MedicalRecord");
const Bed = require("./Bed");
const AdvancePayment = require("./AdvancePayment");
const cron = require("node-cron");

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
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    room_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    department_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    start_date: { 
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    },
    end_date: { type: DataTypes.DATE, allowNull: true },
    diagnosis: { type: DataTypes.TEXT, allowNull: true }, 
    notes: { type: DataTypes.TEXT, allowNull: true }, 
    conclusion_of_treatment: { type: DataTypes.TEXT, allowNull: true }, 
    status: { type: DataTypes.INTEGER, defaultValue: 0 },
    current_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, 
    total_advance_payment: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 }, 
    refunded_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }, 
    payment_status: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: "TreatmentSession", tableName: "treatment_sessions", timestamps: true, underscored: true }
);

/**
 * 🏥 Trước khi tạo hoặc cập nhật `TreatmentSession`, tính `current_cost` & `total_advance_payment`
 */
async function calculateCosts(session) {
    const bed = await Bed.findByPk(session.bed_id);
    if (!bed) return;

    const bedPricePerDay = bed.price;

    // ✅ Nếu đã xuất viện, tính từ ngày vào đến ngày ra
    const endDate = session.status === 0
        ? new Date()                          // Đang nằm viện
        : new Date(session.end_date);         // Đã xuất viện

    const startDate = new Date(session.start_date);

    // Tính số ngày nằm viện (ít nhất là 1 ngày)
    const daysInHospital = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

    // 📌 Tính bảo hiểm hỗ trợ
    let insuranceDiscount = 0;
    if (bed.health_insurance_applied) {
        insuranceDiscount = (bed.health_insurance_value / 100) * (daysInHospital * bedPricePerDay);
    }

    // 📌 Tính chi phí
    session.current_cost = (daysInHospital * bedPricePerDay) - insuranceDiscount;

    // 📌 Tính tổng số tiền tạm ứng
    const totalAdvance = await AdvancePayment.sum("amount", {
        where: { treatment_session_id: session.id }
    });

    session.total_advance_payment = totalAdvance || 0;
}



// 📌 Hook trước khi tạo & cập nhật session
TreatmentSession.beforeCreate(calculateCosts);
TreatmentSession.beforeUpdate(calculateCosts);

/**
 * 🕛 Tự động cập nhật `current_cost` mỗi ngày lúc 00:00
 */
cron.schedule('0 0 * * *', async () => {
        const sessions = await TreatmentSession.findAll({
        where: { status: { [Op.ne]: 0 } } // Chỉ cập nhật session chưa hoàn thành
    });

    for (const session of sessions) {
        await calculateCosts(session);
        await session.save();
    }

    console.log("✅ Cập nhật chi phí điều trị thành công!");
}, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
});

module.exports = TreatmentSession;
