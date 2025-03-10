const MedicalRecordServiceInterface = require('../interface/MedicalRecordServiceInterface');
const { MedicalRecord, Medication, Service } = require('../models');
const { Op } = require('sequelize');

class MedicalRecordService extends MedicalRecordServiceInterface {
    constructor() {
        super();
    }

    async getMedicalRecordList(fieldSelects = ['*'], conditions = [], relations = [], fieldSearch = [], orderBy = ['updated_at', 'ASC'], limit = 20, isDiagnosis) {
        let query = {
            attributes: fieldSelects,
            where: {},
            include: [],
            order: [[orderBy[0], orderBy[1]]],
            limit: limit,
        };

        if (conditions.length) {
            conditions.forEach(condition => {
                query.where[condition[0]] = { [Op[condition[1]]]: condition[2] };
            });
        }

        if (relations.includes('patient')) {
            query.include.push({ association: 'patient' });
        }

        if (!isDiagnosis) {
            query.where[Op.and] = [
                sequelize.literal(`
                    (SELECT COUNT(*) FROM medical_record_service WHERE medical_record_service.medical_record_id = medical_records.id AND medical_record_service.result_details IS NOT NULL) = 
                    (SELECT COUNT(*) FROM medical_record_service WHERE medical_record_service.medical_record_id = medical_records.id)
                `),
            ];
        }

        return await MedicalRecord.findAll(query);
    }

    async save(payload) {
        const transaction = await sequelize.transaction();
        try {
            await MedicalRecord.update(payload.medical_record.data, {
                where: { id: payload.medical_record.medical_record_id },
                transaction,
            });

            const medicalRecord = await MedicalRecord.findByPk(payload.medical_record.medical_record_id, { transaction });

            let pivotData = payload.medications.data.map(item => ({
                medication_id: item.medication_id,
                name: item.name,
                dosage: item.dosage,
                measure: item.measure,
                description: item.description,
            }));

            await medicalRecord.addMedications(pivotData, { transaction });

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }

    async createPivot(payload) {
        const transaction = await sequelize.transaction();
        try {
            let pivotData = payload.services.map(item => ({
                service_id: item.service_id,
                service_name: item.service_name,
                room_id: item.room_id,
                patient_id: item.patient_id,
            }));

            let medicalRecord = await MedicalRecord.findByPk(payload.medical_record_id, { transaction });

            if (medicalRecord) {
                await medicalRecord.addServices(pivotData, { transaction });
                await medicalRecord.update({ status: 1 }, { transaction });
            }

            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }
}

module.exports = new MedicalRecordService();
