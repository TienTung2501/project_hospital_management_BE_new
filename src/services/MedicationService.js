const Medication = require("../models/Medication");
const BaseService = require("./BaseService");

class MedicationService extends BaseService {
  constructor() {
    super(Medication);
  }
}

module.exports = new MedicationService();
