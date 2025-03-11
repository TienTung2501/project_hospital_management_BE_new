const ServiceCatalogue = require("../models/ServiceCatalogue");
const BaseService = require("./BaseService");

class ServiceCatalogueService  extends BaseService {
    constructor(){
        super(ServiceCatalogue)
    }
}

module.exports = new ServiceCatalogueService();
