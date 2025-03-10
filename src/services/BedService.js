const BaseService = require('../services/BaseService');
const { Bed } = require('../models');

class BedService extends BaseService {
    constructor() {
        super(Bed);
    }
}

module.exports = new BedService();
