const {  MedicalRecord,MedicalRecordMedication,MedicalRecordServiceModel, TreatmentSession, Bill,BillDetail, Bed } = require('../models');
const { Op,Sequelize } = require('sequelize');
const sequelize = require("../config/database"); // Import sequelize đúng cách
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
       // Bắt đầu transaction
    const transaction = await sequelize.transaction();
    try {
        // 🔍 Tìm hồ sơ y tế
        let medicalRecord = await MedicalRecord.findByPk(payload.medical_record_id, { transaction });

        if (!medicalRecord) {
            await transaction.rollback();
            return [];
        }

        let billIds = [];

        for (let i = 0; i < payload.services.length; i++) {
            // ➕ Tạo hóa đơn (Bill) cho từng dịch vụ
            let billPayload = {
                patient_id: payload.patient_id,
                treatment_session_id: payload.treatment_session_id,
                bill_type: "services",
            };

            let bill = await Bill.create(billPayload, { transaction });
            billIds.push(bill.id);

            // 📌 Tạo chi tiết hóa đơn (BillDetail)
            let billDetailPayload = {
                bill_id: bill.id,
                model_id: payload.services[i].service_id,
                model_type: "services",
                quantity: 1, // Giả sử số lượng mặc định là 1, có thể thay đổi nếu cần
                total_price: payload.services[i].price, // Tổng giá của dịch vụ
                total_insurance_covered: payload.services[i].insurance_covered || 0, // Bảo hiểm chi trả
            };

            await BillDetail.create(billDetailPayload, { transaction });

            // 🔄 Cập nhật lại tổng tiền Bill sau khi thêm BillDetail
            await Bill.updateBill(bill.id, transaction);
        }

        // 📌 Chuẩn bị dữ liệu cho MedicalRecordServiceModel
        let pivotData = payload.services.map((item, index) => ({
            medical_record_id: payload.medical_record_id,
            service_id: item.service_id,
            service_name: item.service_name,
            room_id: item.room_id,
            patient_id: item.patient_id,
            bill_id: billIds[index], // Gán bill_id từ hóa đơn tương ứng
        }));

        let createdRecords = await MedicalRecordServiceModel.bulkCreate(pivotData, {
            transaction,
            returning: true, 
        });

        let pivotIds = createdRecords.map(record => record.id);

        // ✅ Cập nhật trạng thái hồ sơ y tế
        await medicalRecord.update({ status: 1 }, { transaction });

        // ✅ Commit transaction nếu mọi thứ thành công
        await transaction.commit();
        return pivotIds;

    } catch (error) {
        // ❌ Rollback transaction nếu có lỗi
        await transaction.rollback();
        console.error("🚨 Lỗi trong createPivotService:", error);
        return [];
    }
    }
    
    
    async createPivotMedication(payload) {
        const transaction = await sequelize.transaction();
        try {
            // Tạo hóa đơn (Bill) trước khi tiếp tục các bước khác
            let billPayload = {
                patient_id: payload.patient_id,
                treatment_session_id: payload.treatment_session_id,
                bill_type: "medications",
            };
    
            let bill = await Bill.create(billPayload, { transaction });
    
        
            // Tạo BillDetail sau khi đã có Bill
            for (let item of payload.medications) {
                let billDetail = {
                    bill_id: bill.id, // Đảm bảo sử dụng Bill ID vừa tạo
                    quantity: item.dosage,
                    model_id: item.medication_id,
                    model_type: "medications",
                };
                await BillDetail.create(billDetail, { transaction });
            }
    
            // Tạo MedicalRecordMedication
            let pivotData = payload.medications.map(item => ({
                medical_record_id: payload.medical_record_id,
                medication_id: item.medication_id,
                name: item.name,
                dosage: item.dosage,
                unit: item.unit,
                description: item.description,
                bill_id: bill.id,
            }));
    
            let createdRecords = await MedicalRecordMedication.bulkCreate(pivotData, {
                transaction,
                returning: true,
            });
            // ✅ Cập nhật lại Bill NGAY TRONG TRANSACTION
            await Bill.updateBill(bill.id, transaction);
            let pivotIds = createdRecords.map(record => record.id);
    
            // Commit transaction sau khi tất cả các thao tác đã hoàn tất
            await transaction.commit();
            return pivotIds;
    
        } catch (error) {
            // Log lỗi chi tiết và rollback transaction
            console.error("🚨 Lỗi xảy ra:", error);
            await transaction.rollback();
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
    
           // Lưu lại instance, điều này sẽ kích hoạt các hooks như afterUpdate
            const bed = await Bed.findByPk( payload.treatment_session.bed_id);
            if (!bed) {
                return { status: 404, message: 'Bed not found' };  // Return error if no bill is found
            }
            const payload_bed={
                patient_id: medicalRecord.patient_id,
                status:1
            }
            /*
            Cập nhật các trường của bill: Sử dụng Object.assign(bill, payload) để cập nhật các trường trong instance của hóa đơn.

            Lưu lại instance: Thay vì gọi Bill.update(), bạn sử dụng bill.save() để lưu lại thay đổi. Việc này sẽ đảm bảo rằng các hooks như afterUpdate được gọi khi bạn lưu instance.
            */
            Object.assign(bed, payload_bed);

            // Save the updated bill instance
            await bed.save();  // Lưu lại instance, điều này sẽ kích hoạt các hooks như afterUpdate

            
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
