const {  MedicalRecord,MedicalRecordMedication,MedicalRecordServiceModel, TreatmentSession, Bill, Bed } = require('../models');
const { Op,Sequelize } = require('sequelize');
const sequelize = require("../config/database"); // Import sequelize đúng cách
const BaseService = require('./BaseService');
const BillService = require('./BillService');

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
                limit: parseInt(limit) ||20,
            };
            if(isDiagnosis!==1){
                query.where.status=1;
            }
            
            if (isDiagnosis===1) {
                query.where[Op.and] = [
                    Sequelize.literal(`
                        (SELECT COUNT(*) FROM medical_record_service 
                         WHERE medical_record_service.medical_record_id = MedicalRecord.id 
                         AND medical_record_service.result_details IS NOT NULL) = 
                        (SELECT COUNT(*) FROM medical_record_service 
                         WHERE medical_record_service.medical_record_id = MedicalRecord.id)
                    `)
                ];
                //query.where.status=1;
            }
            console.log(query);
            return await MedicalRecord.findAll(query);
        } catch (error) {
            console.error("Error in fetchMedicalRecords:", error);
            throw error;
        }
    }
    
    async save(payload) {
        const transaction = await sequelize.transaction();
        try {
            // 📝 Cập nhật thông tin hồ sơ bệnh án
            await MedicalRecord.update(payload.medical_record.data, {
                where: { id: payload.medical_record.medical_record_id },
                transaction,
            });
    
            // 🔍 Kiểm tra xem hồ sơ bệnh án có tồn tại không
            const medicalRecord = await MedicalRecord.findByPk(payload.medical_record.medical_record_id, { transaction });
            if (!medicalRecord) {
                await transaction.rollback();
                return false;
            }
    
            // 📌 Gọi `createPivotMedication()` để tạo các bản ghi thuốc
            let pivotMedicationIds = await this.createPivotMedication(payload);
    
            // 🔄 Cập nhật trạng thái hồ sơ y tế nếu có thuốc được chỉ định
            if (pivotMedicationIds.length > 0) {
                await medicalRecord.update({ status: 1 }, { transaction });
            }
    
            // ✅ Commit transaction nếu mọi thứ thành công
            await transaction.commit();
            return true;
        } catch (error) {
            //Rollback transaction nếu có lỗi
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }
    

    async createPivotService(payload) {
        // Bắt đầu transaction
        /*
         const payload_service={
                treatment_session_id:payload.treatment_session_id||null,
                medical_record_id: payload.medical_record_id, // ID của hồ sơ bệnh án
                services: payload.order_detail
            }
        */
        const transaction = await sequelize.transaction();
        try {
            // 📌 Chuẩn bị dữ liệu cho MedicalRecordServiceModel
            let pivotData = payload.services.map(item => ({
                medical_record_id: payload.medical_record_id,
                service_id: item.service_id,
                service_name: item.service_name,
                room_id: item.room_id,
                patient_id: item.patient_id
            }));
    
            // 🔍 Tìm hồ sơ y tế
            let medicalRecord = await MedicalRecord.findByPk(payload.medical_record_id, { transaction });
    
            if (!medicalRecord) {
                await transaction.rollback();
                return [];
            }
    
            // ➕ Tạo bản ghi trong MedicalRecordServiceModel và lấy danh sách ID được tạo
            let createdRecords = await MedicalRecordServiceModel.bulkCreate(pivotData, {
                transaction,
                returning: true // ✅ Lấy danh sách ID của các bản ghi vừa tạo
            });
    
            // 📌 Trích xuất danh sách ID (pivot_id)
            let pivotIds = createdRecords.map(record => record.id);
            console.log("✅ Danh sách pivot_id:", pivotIds);
    
            // 🔄 Tạo hóa đơn (Bill) cho từng dịch vụ
            for (let i = 0; i < pivotIds.length; i++) {
                let billPayload = {
                    treatment_session_id: payload.treatment_session_id, // Vì đây là dịch vụ ngoại trú
                    bill_type: "services",
                    pivot_id: pivotIds[i], // Gán pivot_id từ dịch vụ vừa tạo
                };
    
                // ➕ Tạo hóa đơn
                let bill = await Bill.create(billPayload, { transaction });
                console.log("Hóa đơn được tạo:", bill.id);
    
                // 📌 Chuẩn bị dữ liệu BillDetail cho dịch vụ
                let billDetailPayload = {
                    bill_id: bill.id,
                    model_id: payload.services[i].service_id, // Gán ID dịch vụ
                    model_type: "services",
                };
    
                // ➕ Tạo chi tiết hóa đơn (BillDetail)
                await BillDetail.create(billDetailPayload, { transaction });
                console.log("✅ Chi tiết hóa đơn được tạo:", billDetailPayload);
            }
    
            // Cập nhật trạng thái hồ sơ y tế
            await medicalRecord.update({ status: 1 }, { transaction });
    
            // Commit transaction
            await transaction.commit();
            return pivotIds; // Trả về danh sách pivot_id
        } catch (error) {
            // Rollback transaction nếu có lỗi
            await transaction.rollback();
            console.error(error);
            return [];
        }
    }
    
    async createPivotMedication(payload) {
        // Bắt đầu transaction
        /*
         const payload_medication={
                treatment_session_id:payload.treatment_session_id||null,
                medical_record_id: payload.medical_record_id, // ID của hồ sơ bệnh án
                medications: payload.order_detail
            }
        */
        const transaction = await sequelize.transaction();
        try {
            // 📌 Chuẩn bị dữ liệu cho MedicalRecordMedication
            let pivotData = payload.medications.data.map(item => ({
                medical_record_id: payload.medical_record.medical_record_id,
                medication_id: item.medication_id,
                name: item.name,
                dosage: item.dosage,
                unit: item.unit,
                description: item.description,
            }));
    
            // ➕ Tạo bản ghi trong MedicalRecordMedication và lấy danh sách ID được tạo
            let createdRecords = await MedicalRecordMedication.bulkCreate(pivotData, { 
                transaction, 
                returning: true // ✅ Lấy danh sách ID của các bản ghi vừa tạo
            });
    
            // 📌 Trích xuất danh sách ID (pivot_id)
            let pivotIds = createdRecords.map(record => record.id);
            console.log("✅ Danh sách pivot_id:", pivotIds);
    
            // 🔄 Tạo một hóa đơn duy nhất (Bill)
            let billPayload = {
                treatment_session_id: payload.treatment_session_id, // Vì đây là thuốc cho bệnh nhân ngoại trú
                bill_type: "medications",
                pivot_id: null, // Không cần gán vì thuốc không có pivot cụ thể
            };
    
            let bill = await Bill.create(billPayload, { transaction });
            console.log("✅ Hóa đơn được tạo:", bill.id);
    
            // 🔄 Tạo nhiều chi tiết hóa đơn (BillDetail)
            let billDetailsPayload = payload.medications.data.map((item, index) => ({
                bill_id: bill.id,
                quantity:item.dosage,
                model_id: item.medication_id, // ID của thuốc
                model_type: "medications",
            }));
    
            await BillDetail.bulkCreate(billDetailsPayload, { transaction });
            console.log("Danh sách chi tiết hóa đơn được tạo:", billDetailsPayload);
    
            //Commit transaction nếu mọi thứ thành công
            await transaction.commit();
            return pivotIds; // Trả về danh sách pivot_id
        } catch (error) {
            //Rollback transaction nếu có lỗi
            await transaction.rollback();
            console.error(error);
            return []; // Trả về mảng rỗng nếu có lỗi
        }
    }
    
    
    
    async createPivotTreatmentSession(payload) {
        // http://localhost:8000/api/medical_records/createPivotTreatmentSession
         /*const payload = {
                {
                    "medical_record": {
                        "medical_record_id": 33,
                        "data": {
                        "is_inpatient": 1,
                        "diagnosis": "Đau tim, có dấu hiệu co thắt cơ tim",
                        "notes": "Cần nhập viện điều trị, tránh tai biến sau này"
                        }
                    },
                    "treatment_sesion": {
                        "medical_record_id": 33,
                        "department_id": 16,
                        "room_id": 44,
                        "bed_id": 4,
                        "user_id": 40,
                        "diagnosis": "Đau tim, có dấu hiệu co thắt cơ tim",
                        "notes": "Cần nhập viện điều trị, tránh tai biến sau này"
                    }
                    }
              };*/
        const transaction = await sequelize.transaction();
        try {
            // 🔍 Kiểm tra medical_record có is_inpatient = 0 không
            const medicalRecord = await MedicalRecord.findOne({
                where: { 
                    id: payload.medical_record.medical_record_id, 
                }, 
                transaction
            });
            
            if (!medicalRecord) {
                console.log("Medical Record không hợp lệ hoặc bệnh nhân đã nhập viện!");
                await transaction.rollback();
                return false;
            }
    
            //  Cập nhật thông tin medical_record (đưa bệnh nhân vào viện)
            await Bed.update(
                { patient_id: medicalRecord.patient_id }, 
                { where: { id: payload.treatment_session.bed_id }, transaction }
            );
            
            if(medicalRecord.is_inpatient===0){
                await MedicalRecord.update(payload.medical_record.data, {
                    where: { id: payload.medical_record.medical_record_id },
                    transaction,
                });
            }   
            
            //  Chuẩn bị dữ liệu cho bảng TreatmentSession
            let pivotData = {
                medical_record_id: payload.medical_record.medical_record_id,
                department_id: payload.treatment_session.department_id,
                room_id: payload.treatment_session.room_id,
                bed_id: payload.treatment_session.bed_id,
                user_id: payload.treatment_session.user_id,
                diagnosis: payload.treatment_session.diagnosis,
                notes: payload.treatment_session.notes
            };
    
            // ➕ Thêm dữ liệu vào bảng TreatmentSession
            await TreatmentSession.create(pivotData, { transaction });
    
            // ✅ Commit transaction nếu mọi thứ thành công
            await transaction.commit();
            return true;
        } catch (error) {
            //Rollback transaction nếu có lỗi
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }
    
}    

module.exports = new MedicalRecordService();
