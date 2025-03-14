const medicalRecordService = require('../services/MedicalRecordService');
const {Patient, Service,User, MedicalRecordService} =require('../models')
const { Op,Sequelize } = require('sequelize');
class MedicalRecordController {
    constructor() {
        this.getMedicalRecordList = this.getMedicalRecordList.bind(this);
        this.getPatientWaitDiagnosis = this.getPatientWaitDiagnosis.bind(this);
        this.getPatientWaitTest = this.getPatientWaitTest.bind(this);
    }
    async getPatientWaitDiagnosis(req, res) {
        return this.getMedicalRecordList(req, res,0);
    }

    async getPatientWaitTest(req, res) {
        return this.getMedicalRecordList(req, res,1);
    }

    async getMedicalRecordList(req, res,status = 1) {
        try {
            const query = req.query || {};
            const { id, keyword, limit = 1, room_id } = query;
    
            let whereCondition = {
                status: status,
                diagnosis: { [Op.is]: null },
            };
    
            if (id !== undefined) whereCondition.id = id;
            if (!status && room_id !== undefined) whereCondition.room_id = room_id;
    
            if (keyword) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { cccd_number: { [Op.like]: `%${keyword}%` } },
                ];
            }
    
            const relations = [
                { model: User, as: 'users' }, // Quan hệ với User
                {
                    model: Patient,
                    as: 'patients',
                    where: keyword ? { name: { [Op.like]: `%${keyword}%` } } : undefined,
                    required: false,
                },
                {
                    model: Service,
                    as: 'services',
                    through: [ 
                        {
                            model: MedicalRecordService,
                            as: 'medical_record_service',
                            where: status
                                ? { result_details: null, ...(room_id ? { room_id } : {}) }
                                : { result_details: { [Op.ne]: null } },
                            required: false, // Tránh lỗi nếu không có dữ liệu
                        }
                    ],
                    required: false,
                },
            ];
            
            
            // Gọi hàm lấy dữ liệu
            const medicalRecords = await medicalRecordService.getMedicalRecordList(whereCondition, relations, [["visit_date", "ASC"]], limit,status);
            return res.status(medicalRecords.length ? 200 : 204).json({
                status: medicalRecords.length ? 200 : 204,
                message: medicalRecords.length ? "success" : "No Data",
                data: id ? medicalRecords[0] : medicalRecords,
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
        const { keyword, status, limit = 1, room_id } = req.query;
        const conditions = [];

        if (status !== undefined) conditions.push({ status });
        if (room_id !== undefined) conditions.push({ room_id });
        const whereCondition = {};
        if (status) whereCondition.status = status;
        const options = {
            where: whereCondition,
            limit,
            order: [['visit_date', 'ASC']],
            relations:[
                { model: Patient, as: 'patients' },
                { model: Service, as: 'services' },
            ]

        };
        
        const medicalRecords = await medicalRecordService.paginate(options);
        if (medicalRecords.rows.length > 0) {
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: {
                    data: medicalRecords.rows,
                    total: medicalRecords.count,
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

            return res.status(medicalRecord ? 201 : 500).json({
                status: medicalRecord ? 201 : 500,
                message: medicalRecord ? 'created' : 'server error',
                data: medicalRecord,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }

    async createPivot(req, res) {
        try {
            const flag = await medicalRecordService.createPivot(req.body);

            return res.status(flag ? 201 : 500).json({
                status: flag ? 201 : 500,
                message: flag ? 'created' : 'server error',
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }

    async save(req, res) {
        try {
            const flag = await medicalRecordService.save(req.body);

            return res.status(flag ? 201 : 500).json({
                status: flag ? 201 : 500,
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

            return res.status(flag ? 204 : 404).json({
                status: flag ? 204 : 404,
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
