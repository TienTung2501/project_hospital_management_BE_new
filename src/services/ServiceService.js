// services/ServiceService.js
const Service = require("../models/Service");
const BaseService = require("./BaseService");

class ServiceService extends BaseService {
   constructor(){
    super(Service)
   }
}

module.exports = new ServiceService();
