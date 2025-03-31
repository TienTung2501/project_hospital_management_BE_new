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
}    

module.exports = new BillService();
