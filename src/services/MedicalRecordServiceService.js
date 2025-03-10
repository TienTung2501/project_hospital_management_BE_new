const MedicalRecordService = require('../models/MedicalRecordService');

class MedicalRecordServiceService {
    async updateMultiple(payload) {
        const transaction = await MedicalRecordService.sequelize.transaction();
        try {
            for (const item of payload) {
                await MedicalRecordService.update(
                    { result_details: item.result_details },
                    { where: { id: item.id }, transaction }
                );
            }
            await transaction.commit();
            return { status: 200, title: 'success' };
        } catch (error) {
            await transaction.rollback();
            console.error('Update error:', error);
            return { status: 500, title: 'server error' };
        }
    }
}

module.exports = new MedicalRecordServiceService();
