const sequelize = require("../config/database");
const Department = require("../models/Department");
const User = require("../models/User");
const Room = require("../models/Room");
const RoomCatalogue = require("../models/RoomCatalogue");
const Position = require("../models/Position");
const Bed = require("../models/Bed");
const Permission = require("../models/Permission");
const Service = require("../models/Service");
const ServiceCatalogue = require("../models/ServiceCatalogue");
const MedicalRecord = require("../models/MedicalRecord");
const MedicalRecordServiceModel = require("../models/MedicalRecordService");
const Medication = require("../models/Medication");
const MedicationCatalogue = require("../models/MedicationCatalogue");
const Patient = require("../models/Patient");
const MedicalRecordMedication=require("../models/MedicalRecordMedication");
const TreatmentSession=require("./TreatmentSession");
const MedicalOrder=require("../models/MedicalOrder");
const DailyHealth=require("../models/DailyHealth");
const Bill=require("../models/Bill");
const BillDetail=require("../models/BillDetail");
const AdvancePayment=require("../models/AdvancePayment");
// 🔹 Định nghĩa bảng trung gian (đặt `tableName` theo số nhiều)
const UserRoom = sequelize.define("user_room", {}, { timestamps: false, tableName: "user_room",underscored:true });
const UserPermission = sequelize.define("user_permission", {}, { timestamps: false, tableName: "user_permission",underscored:true });


// 🔹 Room Associations
Room.belongsTo(Department, { foreignKey: "department_id", as: "departments" }); 
Room.belongsTo(RoomCatalogue, { foreignKey: "room_catalogue_id", as: "room_catalogues" });
Room.hasMany(Bed, { foreignKey: "room_id", as: "beds" });
Room.belongsToMany(User, { through: UserRoom, foreignKey: "room_id", otherKey: "user_id", as: "users" });

// 🔹 RoomCatalogue
RoomCatalogue.hasMany(Room, { foreignKey: "room_catalogue_id", as: "rooms" });
RoomCatalogue.hasMany(Service, { foreignKey: "room_catalogue_id", as: "services" });
// 🔹 Bed
Bed.belongsTo(Room, { foreignKey: "room_id", as: "rooms" });
Bed.belongsTo(Patient, { foreignKey: "patient_id", as: "patients" });

// 🔹 User
User.belongsTo(Department, { foreignKey: 'department_id', as: 'departments' });
User.belongsTo(Position, { foreignKey: 'position_id', as: 'positions' });
User.belongsToMany(Room, { through: UserRoom, foreignKey: "user_id", otherKey: "room_id", as: "rooms" });
User.belongsToMany(Permission, { through: UserPermission, foreignKey: "user_id", otherKey: "permission_id", as: "permissions" });
User.hasMany(MedicalRecord, { foreignKey: 'user_id', as: 'medical_records' });
// 🔹 Service
Service.belongsTo(ServiceCatalogue, { foreignKey: "service_catalogue_id", as: "service_catalogues" });
Service.belongsTo(RoomCatalogue, { foreignKey: "room_catalogue_id", as: "room_catalogues" });
Service.belongsToMany(MedicalRecord, { 
  through: MedicalRecordServiceModel, 
  foreignKey: "service_id", 
  otherKey: "medical_record_id", 
  as: "medical_records" 
});
Service.hasMany(MedicalRecordServiceModel, { foreignKey: 'service_id', as: 'medical_record_service' });

// 🔹 MedicalRecord
MedicalRecord.belongsTo(User, { foreignKey: 'user_id', as: 'users' });
MedicalRecord.belongsTo(Patient, { foreignKey: "patient_id", as: "patients" });
// MedicalRecord.belongsToMany(Service, { through: MedicalRecordServiceModelRelation, foreignKey: "medical_record_id", otherKey: "service_id", as: "services" });
 MedicalRecord.belongsToMany(Medication, { through: MedicalRecordMedication, foreignKey: "medical_record_id", otherKey: "medication_id", as: "medications" });
 MedicalRecord.belongsToMany(Service, {  through: MedicalRecordServiceModel,   foreignKey: "medical_record_id",   otherKey: "service_id",   as: "services" });
 MedicalRecord.hasMany(MedicalRecordServiceModel, {
  foreignKey: "medical_record_id",
  as: "medical_record_service", // Đặt alias khớp với truy vấn SQL
});
 MedicalRecord.hasMany(TreatmentSession, {
  foreignKey: "medical_record_id",
  as: "treatment_sesions", // Đặt alias khớp với truy vấn SQL
});


TreatmentSession.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id' });
DailyHealth.belongsTo(TreatmentSession, { foreignKey: 'treatment_session_id' });
MedicalOrder.belongsTo(TreatmentSession, { foreignKey: 'treatment_session_id' });
TreatmentSession.hasMany(MedicalOrder, { foreignKey: 'treatment_session_id' });
TreatmentSession.hasMany(DailyHealth, { foreignKey: 'treatment_session_id' });

MedicalRecordServiceModel.belongsTo(MedicalRecord, {
  foreignKey: "medical_record_id",
  as: "medical_records",
});

MedicalRecordServiceModel.belongsTo(Service, { foreignKey: "service_id", as: "services" });
Medication.belongsToMany(MedicalRecord, {
  through: MedicalRecordMedication,
  foreignKey: "medication_id",
  otherKey: "medical_record_id",
});

// Quan hệ: Một TreatmentSession có nhiều hóa đơn

// 🔹 Quan hệ 1-N: Một MedicalRecord có nhiều MedicalRecordMedication
MedicalRecord.hasMany(MedicalRecordMedication, {
  foreignKey: "medical_record_id",
});
MedicalRecordMedication.belongsTo(MedicalRecord, {
  foreignKey: "medical_record_id",
});
MedicalOrder.belongsTo(TreatmentSession, { foreignKey: 'treatment_session_id' });
// 🔹 Quan hệ 1-N: Một Medication có nhiều MedicalRecordMedication
Medication.hasMany(MedicalRecordMedication, {
  foreignKey: "medication_id",
});
MedicalRecordMedication.belongsTo(Medication, {
  foreignKey: "medication_id",
});
// Patient
Patient.hasMany(MedicalRecord, { foreignKey: "patient_id", as: "medical_records" }); 

// 🔹 Medication
Medication.belongsTo(MedicationCatalogue, { foreignKey: "medication_catalogue_id", as: "medication_catalogues" });
// nháp

BillDetail.belongsTo(Bill, { foreignKey: 'bill_id' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // Cập nhật bảng nếu có thay đổi
    console.log("Database synced successfully!");
  } catch (error) {
    console.error("Database sync failed:", error);
  }
};

module.exports = { 
  sequelize, syncDatabase, 
  Department, User, Room, RoomCatalogue, Position, Permission, 
  Service, ServiceCatalogue, Bed, MedicalRecord, MedicalRecordServiceModel, MedicalRecordMedication,
  Medication, MedicationCatalogue, Patient ,TreatmentSession,MedicalOrder,DailyHealth,Bill,BillDetail
};
