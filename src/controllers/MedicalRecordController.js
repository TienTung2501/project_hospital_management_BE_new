const MedicalRecordService = require('../services/MedicalRecordService');

class MedicalRecordController {
    async index(req, res) {
        const { keyword, status, limit = 1, room_id } = req.query;
        const conditions = [];

        if (status !== undefined) conditions.push({ status });
        if (room_id !== undefined) conditions.push({ room_id });

        try {
            const medicalRecords = await MedicalRecordService.paginate(
                this.getFields(),
                conditions,
                ['patient', 'services'],
                [],
                keyword,
                ['visit_date', 'ASC'],
                limit
            );

            return res.status(medicalRecords.length ? 200 : 204).json({
                status: medicalRecords.length ? 200 : 204,
                message: medicalRecords.length ? 'success' : 'No Data',
                data: medicalRecords,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }

    async getPatientWaitDiagnosis(req, res) {
        return this.getMedicalRecordList(req, 0, res);
    }

    async getPatientWaitTest(req, res) {
        return this.getMedicalRecordList(req, 1, res);
    }

    async getMedicalRecordList(req, status = 1, res) {
        const { id, keyword, limit = 1, room_id } = req.query;
        const conditions = [];

        if (id !== undefined) conditions.push({ id });
        conditions.push({ diagnosis: null }, { status: 1 });

        if (!status) conditions.push({ room_id });

        const relations = {
            user: [],
            patient: [{ keyword: keyword || '' }],
            services: [],
        };

        if (status) {
            relations.services.push({ result_details: null }, { room_id });
        } else {
            relations.services.push({ result_details: { $ne: null } });
        }

        try {
            const medicalRecords = await MedicalRecordService.getMedicalRecordList(
                this.getFields(),
                conditions,
                relations,
                ['name', 'cccd_number'],
                ['updated_at', 'ASC'],
                limit,
                status
            );

            return res.status(medicalRecords.length ? 200 : 204).json({
                status: medicalRecords.length ? 200 : 204,
                message: medicalRecords.length ? 'success' : 'No Data',
                data: id ? medicalRecords[0] : medicalRecords,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }

    async show(req, res) {
        const { id } = req.params;

        try {
            const medicalRecord = await MedicalRecordService.getById(id);

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
            const medicalRecord = await MedicalRecordService.create(req.body);

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
            const flag = await MedicalRecordService.createPivot(req.body);

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
            const flag = await MedicalRecordService.save(req.body);

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
            const medicalRecord = await MedicalRecordService.getById(id);
            if (!medicalRecord) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            const updatedRecord = await MedicalRecordService.update(id, req.body);

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
