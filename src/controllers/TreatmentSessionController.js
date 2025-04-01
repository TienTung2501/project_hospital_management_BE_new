const { Op,Sequelize } = require('sequelize');
const AdvancePayment = require('../models/AdvancePayment');
const TreatmentSessionService = require('../services/TreatmentSessionService');
const { DailyHealth, MedicalRecordServiceModel } = require('../models');
class TreatmentSessionController{
    constructor() {
    }
    //thêm sẽ được thêm trong medical_record vì là bảng liên kết với medicalrecord.
        async createPivotDailyHealth(req, res) {
            try {
                const flag = await DailyHealth.create(req.body);

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
                    const flag = await TreatmentSessionService.createPivotMedicalOrder(req.body);
        
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
        async deletePivotMedicalOrderService(req, res) {
            const { id } = req.params;
    
            try {
                const flag = await MedicalRecordServiceModel.delete(id);
    
                return res.status(flag ? 200 : 404).json({
                    status: flag ? 200 : 404,
                    message: flag ? 'success' : 'error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
        async deletePivotMedicalOrderMedication(req, res) {
            const { id } = req.params;
    
            try {
                const flag = await MedicalRecordMedication.delete(id);
    
                return res.status(flag ? 200 : 404).json({
                    status: flag ? 200 : 404,
                    message: flag ? 'success' : 'error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
        async update(req, res) {
            /*
            payload={
            "conclusion_of_treatment":"Bệnh tiến triển tốt, các chỉ số đều ổn, kiểm tra toàn bộ thấy chức năng cấu tạo không có bất thường. Có thể xuất viện."
            "status:"1
            }
            */
            const { id } = req.params;  // Get the id from URL parameter
            try {
                const flag = await TreatmentSessionService.update(id,req.body);
    
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