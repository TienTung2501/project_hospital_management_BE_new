const { Op,Sequelize } = require('sequelize');
const { Bill, BillDetail } = require('../models');
class BillController{
        async index(req, res) {
            const { keyword, status, limit = 1, room_id,date } = req.query;

            const whereCondition = {};
            // if (status) whereCondition.status = status;
            if (room_id) whereCondition.room_id = room_id;
                // Lấy ngày hôm nay theo chuẩn UTC (00:00:00 - 23:59:59)
            const selectedDate = date ? moment.utc(date, "YYYY-MM-DD") : moment.utc();
            // Lấy khoảng thời gian từ 00:00:00 - 23:59:59 của ngày đã chọn
            const dayStart = selectedDate.startOf("day").toISOString(); // 2025-03-20T00:00:00.000Z
            const dayEnd = selectedDate.endOf("day").toISOString();   // 2025-03-20T23:59:59.999Z
            
            //http://localhost:8000/api/medicalRecords/waitDiagnosis?date=2025-03-16 nếu truyền vào date
            //http://localhost:8000/api/medicalRecords/list?date=2025-03-16 nếu truyền vào date
            whereCondition.visit_date = { [Op.between]: [dayStart, dayEnd] };
            const options = {
                where: whereCondition,
                limit,
                order: [['visit_date', 'ASC']],
                relations:[
                    { model: Patient, as: 'patients' },
                    { model: Service,
                        as: "services",
                        through: {
                            model: MedicalRecordServiceModel,
                        },
                        required: false, },
                ]

            };
            const medicalRecords = await medicalRecordService.paginate(options);
            if (medicalRecords.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data: medicalRecords.rows,
                        total: medicalRecords.rows.length,
                    }
                });
            } else {
                return res.status(204).json({
                    status: 204,
                    message: 'No Data'
                });
            }
        } catch (error) {
            console.error('Error in index:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
        async show(req, res) {
            const { id } = req.params;
    
            try {
                const medicalRecord = await medicalRecordService.getById(id);
    
                if (!medicalRecord) {
                    return res.status(404).json({ status: 404, message: 'Not Found' });
                }
    
                return res.status(200).json({ status: 200, message: 'success', data: medicalRecord });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
        async update(req, res) {
            const { id } = req.params;
    
            try {
                const medicalRecord = await medicalRecordService.getById(id);
                if (!medicalRecord) {
                    return res.status(404).json({ status: 404, message: 'Not Found' });
                }
    
                const updatedRecord = await medicalRecordService.update(id, req.body);
    
                return res.status(200).json({
                    status: 200,
                    message: 'success',
                    data: updatedRecord,
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
}
module.exports = new BillController();