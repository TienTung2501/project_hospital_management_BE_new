const { Op,Sequelize } = require('sequelize');
const { TreatmentSession } = require('../models');
const AdvancePayment = require('../models/AdvancePayment');
const TreatmentSessionService = require('../services/TreatmentSessionService');
class TreatmentSessionController{
    constructor() {
    }
    //thêm sẽ được thêm trong medical_record vì là bảng liên kết với medicalrecord.
        async createPivotDailyHealth(req, res) {
            try {
                const flag = await treatmentSessionService.createPivotDailyHealth(req.body);

                return res.status(flag ? 200 : 500).json({
                    status: flag ? 200 : 500,
                    message: flag ? 'created' : 'server error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
        async createPivotMedicalOrder(req, res) {
                try {
                    const flag = await treatmentSessionService.createPivot(req.body);
        
                    return res.status(flag ? 200 : 500).json({
                        status: flag ? 200 : 500,
                        message: flag ? 'created' : 'server error',
                    });
                } catch (error) {
                    return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
                }
            }
        async createPivotAdvancePayment(req, res) {
                try {
                    /*
                        payload gửi vào:
                            const payload = {
                                treatment_session_id: Number(treatment_session_id), // ID của hồ sơ bệnh án
                                temperature: temperature, // ID của đợt điều trị
                                blood_pressure: blood_pressure, // ID của đợt điều trị
                                heart_rate: heart_rate, // ID của đợt điều trị
                                notes: "note", // ID của đợt điều trị
                            };
                        */
                    const flag = await AdvancePayment.create(req.body);
        
                    return res.status(flag ? 200 : 500).json({
                        status: flag ? 200 : 500,
                        message: flag ? 'created' : 'server error',
                    });
                } catch (error) {
                    return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
                }
            }
        async delete(req, res) {
            const { id } = req.params;
    
            try {
                const flag = await MedicalRecordService.delete(id);
    
                return res.status(flag ? 200 : 404).json({
                    status: flag ? 200 : 404,
                    message: flag ? 'success' : 'error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
        async save(req, res) {
            try {
                const flag = await TreatmentSessionService.save(req.body);
    
                return res.status(flag ? 200 : 500).json({
                    status: flag ? 200 : 500,
                    message: flag ? 'created' : 'server error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
}
module.exports = new TreatmentSessionController();