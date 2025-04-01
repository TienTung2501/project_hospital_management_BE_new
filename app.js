require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { syncDatabase } = require("./src/models/index");
//routes
const departmentRoutes = require('./src/routes/DepartmentRoutes');
const userRoutes = require('./src/routes/UserRoutes');
const roomRoutes = require("./src/routes/RoomRoutes");
const roomCatalogueRoutes = require("./src/routes/RoomCatalogueRoutes");
const positionRoutes = require("./src/routes/PositionRoutes");
const permissionRoutes = require("./src/routes/PermissionRoutes");
const bedRoutes = require("./src/routes/BedRoutes");
const serviceRoutes = require("./src/routes/ServiceRoutes");
const serviceCatalogueRoutes = require("./src/routes/ServiceCatalogueRoutes");
const medicationRoutes = require("./src/routes/MedicationRoutes");
const medicationCatalogueRoutes = require("./src/routes/MedicationCatalogueRoutes");
const medicalrecordRoutes = require("./src/routes/MedicalRecordRoutes");
const medicalrecordServiceRoutes = require("./src/routes/MedicalRecordServiceRoutes");
const patientRoutes = require("./src/routes/PatientRoutes");
const treatmentSessionRoutes = require("./src/routes/TreatmentSessionRoutes");
const billRoutes = require("./src/routes/BillRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use('/api/departments', departmentRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/roomCatalogues", roomCatalogueRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/serviceCatalogues", serviceCatalogueRoutes);
app.use("/api/medications", medicationRoutes);
app.use("/api/medicationCatalogues", medicationCatalogueRoutes);
app.use("/api/medicalRecords", medicalrecordRoutes);
app.use("/api/medicalRecordService", medicalrecordServiceRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/treatmentSessions", treatmentSessionRoutes);
app.use("/api/bills", billRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to the API. Use /departments to access data.');
});
syncDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});
