const moment = require("moment");
const { Op,Sequelize } = require('sequelize');
const { Bill, BillDetail, MedicalRecord, Patient } = require('../models');
const BillService = require('../services/BillService');
class BillController{
        async index(req, res) {
            const { keyword, status, limit = 20, room_id,date } = req.query;
            const whereCondition={}
            if (status) whereCondition.status = status;
            if (room_id) whereCondition.room_id = room_id;
                // Lấy ngày hôm nay theo chuẩn UTC (00:00:00 - 23:59:59)
                const patientWhereCondition = keyword
                ? {
                      [Op.or]: [
                          { name: { [Op.like]: `%${keyword}%` } },
                          { cccd_number: { [Op.like]: `%${keyword}%` } },
                      ],
                  }
                : undefined;
                  
            //http://localhost:8000/api/medicalRecords/waitDiagnosis?date=2025-03-16 nếu truyền vào date
            //http://localhost:8000/api/medicalRecords/list?date=2025-03-16 nếu truyền vào date
            const options = {
                where: whereCondition,
                limit,
                order: [['created_at', 'ASC']],
                relations: [
                    {
                        model: Patient,
                        as: "patients",
                        where: patientWhereCondition,
                        required: true, // Đảm bảo nếu không có patient vẫn lấy Bill
                    },
                    {
                        model: BillDetail,
                        as: "bill_details",
                    },
                   ],

            };
            const bills = await BillService.paginate(options);
            if (bills.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data: bills.rows,
                        total: bills.rows.length,
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
            /*
            payload={
                "status":1
            }
            */
            const { id } = req.params;  // Get the id from URL parameter
            try {
                // Directly call the update method of the service
                const updatedRecord = await BillService.update(id, req.body);
                
                if (updatedRecord.status === 404) {
                    return res.status(404).json({ status: 404, message: updatedRecord.message });
                }
        
                return res.status(updatedRecord.status).json({
                    status: updatedRecord.status,
                    message: updatedRecord.message,
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