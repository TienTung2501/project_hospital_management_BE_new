const BaseService = require("./baseService");
const Patient = require("../models/patient");

class PatientService extends BaseService {
  constructor() {
    super(Patient);
  }

  async getHistory(id) {
    return await Patient.findByPk(id, {
      include: [
        {
          association: "medicalRecords",
          include: ["services", "user", "medications"],
        },
      ],
    });
  }
}

module.exports = new PatientService();
