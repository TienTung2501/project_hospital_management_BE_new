const { MedicalRecord,  Service,User,Patient } = require('../models');
const { Op,Sequelize } = require('sequelize');
const BaseService = require('./BaseService');

class MedicalRecordService extends BaseService {
    constructor() {
        super(MedicalRecord);
    }

    async getMedicalRecordList(where = {}, relations = [], orderBy = ["visit_date", "ASC"], limit = 20, isDiagnosis) {
        try {
            let query = {
                where,
                include: relations, // Nhận `include` từ tham số `relations`
                order: orderBy && orderBy.length === 2 ? [[orderBy[0], orderBy[1]]] : [],
                limit: parseInt(limit, 20),
            };
    
            if (isDiagnosis === 0) {
                query.where[Op.and] = [
                    Sequelize.literal(`
                        (SELECT COUNT(*) FROM medical_record_service 
                         WHERE medical_record_service.medical_record_id = MedicalRecord.id 
                         AND medical_record_service.result_details IS NOT NULL) = 
                        (SELECT COUNT(*) FROM medical_record_service 
                         WHERE medical_record_service.medical_record_id = MedicalRecord.id)
                    `)
                ];
            }
            
    
            console.log("Query executed:", JSON.stringify(query, null, 2));
            return await MedicalRecord.findAll(query);
        } catch (error) {
            console.error("Error in fetchMedicalRecords:", error);
            throw error;
        }
    }
    
    async save(payload) {
        const transaction = await sequelize.transaction();
        try {
            await MedicalRecord.update(payload.medical_records.data, {
                where: { id: payload.medical_records.medical_record_id },
                transaction,
            });

            const medicalRecord = await MedicalRecord.findByPk(payload.medical_records.medical_record_id, { transaction });

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
