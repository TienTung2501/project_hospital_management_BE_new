const {  TreatmentSession, MedicalOrder,Bill,BillDetail,Bed } = require('../models');
const { Op,Sequelize } = require('sequelize');
const sequelize = require("../config/database"); // Import sequelize đúng cách
const BaseService = require('./BaseService');
const MedicalRecordService=require('./MedicalRecordService')

class TreatmentSessionService extends BaseService {
    constructor() {
        super(TreatmentSession);
    }
    async createPivotMedicalOrder(payload) {// chỉ định dịch vụ cho bệnh nhân., sau khi bệnh nhân được chỉ định thì status của medicalrecord chuyển thành 1 và có thêm bảng medical_record_service
        /*
        http://localhost:8000/api/treatmentSessions/createPivotMedicalOrder
        payload gửi vào:
            const payload = {
              medical_record_id: Number(medical_record_id), // ID của hồ sơ bệnh án
              patient_id: Number(patient_id), // ID của hồ sơ bệnh án
              treatment_session_id: Number(treatment_session_id), // ID của đợt điều trị
              order_type: "services", // ID của đợt điều trị
              order_detail: servicePatients.map(({ service_id, room_id, service_name }) => ({
                service_id: Number(service_id),
                service_name,
                room_id: Number(room_id),
                patient_id: Number(patient?.id),
              })),
               notes: "note", // ID của đợt điều trị
            };
            
            const payload = {
                medical_record_id: Number(medical_record_id), // ID của hồ sơ bệnh án
                treatment_session_id: Number(treatment_session_id), // ID của đợt điều trị
                patient_id: Number(patient_id), // ID của đợt điều trị
                order_type: "medications", // loại order
                order_detail: medicationDetails.map((medication) => ({
                medication_id: Number(medication.id), // ID của thuốc
                name: medication.name, // Tên thuốc
                dosage:medication.dosage.toString(),
                measure: medication.measure, // Đơn vị đo
                description: medication.description, // Mô tả
                })),
                notes: "note", // ID của đợt điều trị
            };
        payload cho hoa don noi tru ngoai tru deu co treatment_id tuy nhien khac nhau la noi tru thi co truyen vao con ngoai tru thi khong
        gio viet ham them hoa don o ben kia, tuy nhien phai truyen vao payload
        */
        
        const transaction = await sequelize.transaction();
        try {
        let pivotId;
        // cứ gọi đến bill đi
        if(payload.order_type==="services"){
            const payload_service={
                patient_id:payload.patient_id,
                treatment_session_id:payload.treatment_session_id||null,
                medical_record_id: payload.medical_record_id, // ID của hồ sơ bệnh án
                services: payload.order_detail
            }
            pivotId = await MedicalRecordService.createPivotService(payload_service);
            // lấy id của pivot để lưu lại cho medical_order
           
        }
        if(payload.order_type==="medications"){
            const payload_medication={
                patient_id:payload.patient_id,
                treatment_session_id:payload.treatment_session_id||null,
                medical_record_id: payload.medical_record_id, // ID của hồ sơ bệnh án
                medications: payload.order_detail
            }
            pivotId = await MedicalRecordService.createPivotMedication(payload_medication,transaction);
            // lấy id của pivot để lưu lại cho medical_order
        }
            let payload_medical_order = {
                treatment_session_id: payload.treatment_session_id,
                detail: JSON.stringify({ type: payload.order_type, pivot_ids: pivotId }), // 🔥 Chuyển JSON thành chuỗi
                notes: payload.notes
            };
        
    
            let treatment_sesion = await TreatmentSession.findByPk(payload.treatment_session_id, { transaction });
    
            if (treatment_sesion) {
                await MedicalOrder.create( payload_medical_order, { transaction }); 
            }
    
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }
    async update(id,payload) {
        const transaction = await sequelize.transaction();
        try {
            const treatment_session = await TreatmentSession.findByPk(id, { transaction });
    
            if (!treatment_session) {
                await transaction.rollback();
                return false;
            }
            const newpayload={
                ...payload,
                end_date:Date.now(),
            }
            // Cập nhật TreatmentSession
            await TreatmentSession.update(newpayload, {
                where: { id:id },
                transaction,
            });
    
            // Giải phóng giường
            await Bed.update(
                { patient_id: null,
                  status:0  
                 }, 
                { where: { id: treatment_session.bed_id }, transaction }
            );
    
            // Tính số ngày nằm viện
            const startDate = new Date(treatment_session.start_date);
            const endDate = treatment_session.end_date ? new Date(treatment_session.end_date) : new Date();
            const daysInHospital = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
            // Tạo hóa đơn cho giường bệnh
            let billPayload = {
                patient_id: payload.patient_id,
                treatment_session_id: treatment_session.id, 
                bill_type: "beds",
            };
    
            let bill = await Bill.create(billPayload, { transaction });
   
            // Tạo chi tiết hóa đơn (BillDetail)
            let billDetailsPayload = {
                bill_id: bill.id,
                quantity: daysInHospital, // ⚡ Gán số ngày nằm viện vào quantity
                model_id: treatment_session.bed_id, // ID giường bệnh
                model_type: "beds", // Xác định loại mô hình là giường bệnh
            };
    
            await BillDetail.create(billDetailsPayload, { transaction });
            await Bill.updateBill(bill.id, transaction);
            //Commit transaction nếu mọi thứ thành công
            await transaction.commit();
            return true;
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            return false;
        }
    }
}    

module.exports = new TreatmentSessionService();
