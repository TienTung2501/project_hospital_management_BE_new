const {  MedicalRecord,MedicalRecordMedication,MedicalRecordService,MedicalRecordServiceModel,TreatmentSession } = require('../models');
const { Op,Sequelize } = require('sequelize');
const sequelize = require("../config/database"); // Import sequelize đúng cách
const BaseService = require('./BaseService');
const Bill = require('../models/Bill');

class BillService extends BaseService {
    constructor() {
        super(Bill);
    }

    async create(payload) {
        try {
            const medicalRecord = await Bill.create(payload);

            return res.status(medicalRecord ? 201 : 500).json({
                status: medicalRecord ? 201 : 500,
                message: medicalRecord ? 'created' : 'server error',
                data: medicalRecord,
            });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
        }
    }
    async createPivotBillDetail(payload) {
            try {
                const flag = await BillDetail.create(payload);
    
                return res.status(flag ? 200 : 500).json({
                    status: flag ? 200 : 500,
                    message: flag ? 'created' : 'server error',
                });
            } catch (error) {
                return res.status(500).json({ status: 500, message: 'Server Error', error: error.message });
            }
        }
    async save(payload) {
        const transaction = await sequelize.transaction();
        try {
            await MedicalRecord.update(payload.medical_record.data, {
                where: { id: payload.medical_record.medical_record_id },
                transaction,
            });

            const medicalRecord = await MedicalRecord.findByPk(payload.medical_record.medical_record_id, { transaction });
            if (!medicalRecord) {
                await transaction.rollback();
                return false;
            }
            let pivotData = payload.medications.data.map(item => ({
                medical_record_id: payload.medical_record.medical_record_id,
                medication_id: item.medication_id,
                name: item.name,
                dosage: item.dosage,
                measure: item.measure,
                description: item.description,
            }));
            console.log("MedicalRecordMedication:", MedicalRecordMedication);

            await MedicalRecordMedication.bulkCreate(pivotData, { transaction });
            await medicalRecord.update({ status: 1 }, { transaction });
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }


    
}    

module.exports = new BillService();
