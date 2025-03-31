const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const TreatmentSession = require("./TreatmentSession");
const { models } = require("../config/database");

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
  { 
    sequelize, 
    modelName: "AdvancePayment", 
    tableName: "advance_payments", 
    timestamps: true, 
    underscored: true 
  }
);

/**
 * 🔄 Hook: Cập nhật `total_advance_payment` trong `TreatmentSession` khi có thay đổi về `AdvancePayment`
 */
async function updateTreatmentAdvancePayment(instance) {
    if (!instance.treatment_session_id) return;

    const totalAdvance = await AdvancePayment.sum("amount", {
        where: { treatment_session_id: instance.treatment_session_id }
    });
    const TreatmentSession = models.TreatmentSession;
    await TreatmentSession.update(
        { total_advance_payment: totalAdvance || 0 }, 
        { where: { id: instance.treatment_session_id } }
    );
}

// Gọi hook sau khi tạo mới hoặc cập nhật `AdvancePayment`
AdvancePayment.afterCreate(updateTreatmentAdvancePayment);
AdvancePayment.afterUpdate(updateTreatmentAdvancePayment);
AdvancePayment.afterDestroy(updateTreatmentAdvancePayment); // Nếu khoản tạm ứng bị xóa, cập nhật lại tổng số tiền

module.exports = AdvancePayment;
