const medicalRecordService = require('../services/MedicalRecordService');
const {Patient,Bed, Service,User, MedicalRecordServiceModel, Medication, MedicalRecordMedication, TreatmentSession, MedicalOrder, DailyHealth,AdvancePayment,Department,Room} =require('../models')
const { Op,Sequelize } = require('sequelize');
const moment = require("moment");

class MedicalRecordController {
    constructor() {
        this.getMedicalRecordList = this.getMedicalRecordList.bind(this);
        this.getPatientWaitDiagnosis = this.getPatientWaitDiagnosis.bind(this);
        this.getPatientWaitTest = this.getPatientWaitTest.bind(this);
    }
    async getPatientWaitDiagnosis(req, res) {
        return this.getMedicalRecordList(req, res,1);
    }

    async getPatientWaitTest(req, res) {
        return this.getMedicalRecordList(req, res,0);
    }

    async getMedicalRecordList(req, res,status = 1) {
        try {
            const query = req.query || {};
            const { id, keyword, limit, room_id, date  } = query;
            const statusValue = status; // ✅ Gán giá trị đúng

            let whereCondition = {
                // diagnosis: { [Op.is]: null },
            };
              // Lấy ngày hôm nay theo chuẩn UTC (00:00:00 - 23:59:59)
            const selectedDate = date ? moment.utc(date, "YYYY-MM-DD") : moment.utc();
            // Lấy khoảng thời gian từ 00:00:00 - 23:59:59 của ngày đã chọn
            const dayStart = selectedDate.startOf("day").toISOString(); // 2025-03-20T00:00:00.000Z
            const dayEnd = selectedDate.endOf("day").toISOString();   // 2025-03-20T23:59:59.999Z
          
            //http://localhost:8000/api/medicalRecords/waitDiagnosis?date=2025-03-16 nếu truyền vào date
            //http://localhost:8000/api/medicalRecords/list?date=2025-03-16 nếu truyền vào date
            whereCondition.visit_date = { [Op.between]: [dayStart, dayEnd] };
            
            if(room_id !== undefined&& statusValue === 1) whereCondition.room_id=room_id;
            if (id !== undefined) whereCondition.id = id;
            const relations = [
                { model: User, as: 'users' }, // Quan hệ với User
                {
                    model: Patient,
                    as: 'patients',
                    where: keyword
                    ? {
                        [Op.or]: [
                            { name: { [Op.like]: `%${keyword}%` } },
                            { cccd_number: { [Op.like]: `%${keyword}%` } },
                            { phone: { [Op.like]: `%${keyword}%` } }
                        ]
                        }
                    : undefined,
                    required: true,
                },
                { 
                    model: MedicalRecordServiceModel, 
                    where: {
                        ...(room_id !== undefined && statusValue === 0 ? { room_id, result_details: null } : {}),
                        ...(statusValue === 0 ? { result_details: null, payment_status: 1 } : {}),
                        ...(statusValue === 1 && {
                          id: {
                            [Op.notIn]: Sequelize.literal(`(
                              SELECT medical_record_service.id
                              FROM medical_record_service
                              WHERE EXISTS (
                                SELECT 1
                                FROM treatment_sessions
                                JOIN medical_orders 
                                  ON treatment_sessions.id = medical_orders.treatment_session_id
                                WHERE treatment_sessions.medical_record_id = medical_record_service.medical_record_id
                                  AND JSON_UNQUOTE(JSON_EXTRACT(medical_orders.detail, '$.type')) = 'services'
                                  AND JSON_CONTAINS(
                                    JSON_EXTRACT(medical_orders.detail, '$.pivot_ids'),
                                    JSON_ARRAY(medical_record_service.id))
                              )
                            )`)
                          },
                          result_details: { [Op.not]: null } // ✅ Gộp logic "đã có kết quả"
                        })
                      },
                      
                    as: "medical_record_service", 
                    include: [{ 
                        model: Service, 
                        as: "services" 
                    }],
                    required: true, 
                },
                { 
                    model: TreatmentSession, 
                    as: "treatment_sessions",
                    include: [
                        { 
                            model: MedicalOrder, 
                            as: "medical_orders" 
                        },
                        { 
                            model: DailyHealth, 
                            as: "daily_healths" 
                        },
                        { 
                            model: AdvancePayment, 
                            as: "advance_payments" 
                        }
                    ], 
                    required: false, 
                },
            ];
            
            // Gọi hàm lấy dữ liệu
            const medicalRecords = await medicalRecordService.getMedicalRecordList(whereCondition, relations, [["visit_date", "ASC"]], limit,statusValue,room_id);
            return res.status(medicalRecords.length ? 200 : 204).json({
                status: medicalRecords.length ? 200 : 204,
                message: medicalRecords.length ? "success" : "No Data",
                data: id ? medicalRecords[0] : medicalRecords,
                total: medicalRecords.length,
            });
        } catch (error) {
            console.error("Error fetching medical records:", error);
            return res.status(500).json({
                status: 500,
                message: "Server Error",
                error: error.message,
            });
        }
    }
    async index(req, res) {
        const { keyword, status, limit = 1, room_id,user_inpatient_id,room_inpatient_id,date } = req.query;

        const whereCondition = {};
        // if (status) whereCondition.status = status;
        if (room_id) whereCondition.room_id = room_id;
        if (status) whereCondition.status = status;
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
            relations: [
                { 
                    model: Patient, 
                    as: 'patients' ,
                    where: keyword
                    ? {
                        [Op.or]: [
                            { name: { [Op.like]: `%${keyword}%` } },
                            { cccd_number: { [Op.like]: `%${keyword}%` } },
                            { phone: { [Op.like]: `%${keyword}%` } }
                        ]
                        }
                    : undefined,
                    required: true,

                },
                { model: User, as: "users" },
                { 
                    model: MedicalRecordServiceModel, 
                    as: "medical_record_service", 
                    include: [{ 
                        model: Service, 
                        as: "services" 
                    }],
                    required: false, 
                },
                { 
                    model: MedicalRecordMedication, 
                    as: "medical_record_medication", 
                    include: [{ 
                        model: Medication, 
                        as: "medications" 
                    }],
                    required: false, 
                },
                { 
                    model: TreatmentSession, 
                    as: "treatment_sessions",
                    where: {
                        ...(room_inpatient_id !== undefined && { room_id: room_inpatient_id }),
                        ...(user_inpatient_id !== undefined && { user_id: user_inpatient_id })
                      },
                      
                      
                    include: [
                        { model: Bed, as: "beds" },
                        { model: User, as: "users" },
                        { model: Department, as: "departments" },
                        { model: Room, as: "rooms" },
                        { 
                            model: MedicalOrder, 
                            as: "medical_orders" 
                        },
                        { 
                            model: DailyHealth, 
                            as: "daily_healths" 
                        },
                        { 
                            model: AdvancePayment, 
                            as: "advance_payments" 
                        }
                    ], 
                    required: false, 
                },
            ],
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
    async showAdvance(req, res) {
        const { keyword, status, limit = 1, room_id,user_inpatient_id,room_inpatient_id,date } = req.query;

        const whereCondition = {};
        // if (status) whereCondition.status = status;
        if (room_id) whereCondition.room_id = room_id;
        if (status) whereCondition.status = status;
           // Lấy ngày hôm nay theo chuẩn UTC (00:00:00 - 23:59:59)
        const selectedDate = date ? moment.utc(date, "YYYY-MM-DD") : moment.utc();
        // Lấy khoảng thời gian từ 00:00:00 - 23:59:59 của ngày đã chọn
        const dayStart = selectedDate.startOf("day").toISOString(); // 2025-03-20T00:00:00.000Z
        const dayEnd = selectedDate.endOf("day").toISOString();   // 2025-03-20T23:59:59.999Z
        //http://localhost:8000/api/medicalRecords/waitDiagnosis?date=2025-03-16 nếu truyền vào date
        //http://localhost:8000/api/medicalRecords/list?date=2025-03-16 nếu truyền vào date
        // whereCondition.visit_date = { [Op.between]: [dayStart, dayEnd] };
        const options = {
            where: whereCondition,
            limit,
            order: [['visit_date', 'ASC']],
            relations: [
                { 
                    model: Patient, 
                    as: 'patients' ,
                    where: keyword
                    ? {
                        [Op.or]: [
                            { name: { [Op.like]: `%${keyword}%` } },
                            { cccd_number: { [Op.like]: `%${keyword}%` } },
                            { phone: { [Op.like]: `%${keyword}%` } }
                        ]
                        }
                    : undefined,
                    required: true,

                },
                { model: User, as: "users" },
                { 
                    model: MedicalRecordServiceModel, 
                    as: "medical_record_service", 
                    include: [{ 
                        model: Service, 
                        as: "services" 
                    }],
                    required: false, 
                },
                { 
                    model: MedicalRecordMedication, 
                    as: "medical_record_medication", 
                    include: [{ 
                        model: Medication, 
                        as: "medications" 
                    }],
                    required: false, 
                },
                { 
                    model: TreatmentSession, 
                    as: "treatment_sessions",
                    where: {
                        ...(room_inpatient_id !== undefined && { room_id: room_inpatient_id }),
                        ...(user_inpatient_id !== undefined && { user_id: user_inpatient_id })
                      },
                      
                      
                    include: [
                        { model: Bed, as: "beds" },
                        { model: User, as: "users" },
                        { model: Department, as: "departments" },
                        { model: Room, as: "rooms" },
                        { 
                            model: MedicalOrder, 
                            as: "medical_orders" 
                        },
                        { 
                            model: DailyHealth, 
                            as: "daily_healths" 
                        },
                        { 
                            model: AdvancePayment, 
                            as: "advance_payments" 
                        }
                    ], 
                    required: false, 
                },
            ],
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

    async create(req, res) {
        try {
            const medicalRecord = await medicalRecordService.create(req.body);

            return res.status(medicalRecord ? 200 : 500).json({
                status: medicalRecord ? 200 : 500,
                message: medicalRecord ? 'created' : 'server error',
                data: medicalRecord,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }

    async createPivot(req, res) {
        try {
            const pivotIds = await medicalRecordService.createPivotService(req.body);
    
            if (pivotIds.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Created successfully',
                    pivot_ids: pivotIds, // ✅ Trả về danh sách pivot_id
                });
            } else {
                return res.status(500).json({
                    status: 500,
                    message: 'Server error',
                });
            }
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }
    

    async save(req, res) {
        try {
            const flag = await medicalRecordService.save(req.body);

            return res.status(flag ? 200 : 500).json({
                status: flag ? 200 : 500,
                message: flag ? 'created' : 'server error',
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }
    async createPivotTreatmentSession(req, res) {
        try {
            const flag = await medicalRecordService.createPivotTreatmentSession(req.body);

            return res.status(flag ? 200 : 500).json({
                status: flag ? 200 : 500,
                message: flag ? 'created' : 'server error',
            });
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

    getFields() {
        return [
            'id',
            'patient_id',
            'user_id',
            'room_id',
            'visit_date',
            'diagnosis',
            'notes',
            'appointment_date',
            'is_inpatient',
            'inpatient_detail',
            'status',
        ];
    }
}

module.exports = new MedicalRecordController();
