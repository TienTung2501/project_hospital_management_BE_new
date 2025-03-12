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
const MedicalRecordService = require("../models/MedicalRecordService");
const Medication = require("../models/Medication");
const MedicationCatalogue = require("../models/MedicationCatalogue");
const Patient = require("../models/Patient");

// 🔹 Định nghĩa bảng trung gian (đặt `tableName` theo số nhiều)
const UserRoom = sequelize.define("user_room", {}, { timestamps: false, tableName: "user_room" });
const UserPermission = sequelize.define("user_permission", {}, { timestamps: false, tableName: "user_permission" });
const MedicalRecordMedication = sequelize.define("medical_record_medications", {}, { timestamps: false, tableName: "medical_record_medications" });
const MedicalRecordServiceRelation = sequelize.define("medical_record_service_relations", {}, { timestamps: false, tableName: "medical_record_service_relations" });

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
User.hasMany(MedicalRecord, { foreignKey: 'user_id', as: 'medicalRecords' });
// 🔹 Service
Service.belongsTo(ServiceCatalogue, { foreignKey: "service_catalogue_id", as: "service_catalogues" });
Service.belongsTo(RoomCatalogue, { foreignKey: "room_catalogue_id", as: "room_catalogues" });
// 🔹 MedicalRecord
MedicalRecord.belongsTo(User, { foreignKey: 'user_id', as: 'users' });
MedicalRecord.belongsTo(Patient, { foreignKey: "patient_id", as: "patients" });
MedicalRecord.belongsToMany(Service, { through: MedicalRecordServiceRelation, foreignKey: "medical_record_id", otherKey: "service_id", as: "services" });
MedicalRecord.belongsToMany(Medication, { through: MedicalRecordMedication, foreignKey: "medical_record_id", otherKey: "medication_id", as: "medications" });
// Patient
Patient.hasMany(MedicalRecord, { foreignKey: "patient_id", as: "medical_records" }); 

// 🔹 Medication
Medication.belongsTo(MedicationCatalogue, { foreignKey: "medication_catalogue_id", as: "medication_catalogues" });

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
  Service, ServiceCatalogue, Bed, MedicalRecord, MedicalRecordService, 
  Medication, MedicationCatalogue, Patient 
};
