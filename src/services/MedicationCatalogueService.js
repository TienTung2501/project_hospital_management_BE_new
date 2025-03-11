const MedicationCatalogue = require('../models/MedicationCatalogue');
const BaseService = require('./BaseService');

class MedicationCatalogueService extends BaseService{
    constructor() {
        super(MedicationCatalogue);
    }
}

module.exports = new MedicationCatalogueService();
