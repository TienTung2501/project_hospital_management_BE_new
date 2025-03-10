const MedicalRecordServiceService = require('../services/MedicalRecordServiceService');

class MedicalRecordServiceController {
    async update(req, res) {
        try {
            let payload = req.body;
            let flag = await MedicalRecordServiceService.updateMultiple(payload);

            res.status(flag ? 200 : 500).json({
                status: flag ? 200 : 500,
                title: flag ? 'success' : 'server error',
            });
        } catch (error) {
            res.status(500).json({ status: 500, title: 'server error', error: error.message });
        }
    }
}

module.exports = new MedicalRecordServiceController();
