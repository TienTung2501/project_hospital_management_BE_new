const BaseService = require("./BaseService");
const Patient = require("../models/Patient");

class PatientService extends BaseService {
  constructor() {
    super(Patient);
  }
}

module.exports = PatientService;
