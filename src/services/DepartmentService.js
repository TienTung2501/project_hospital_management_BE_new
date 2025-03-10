const BaseService = require('./BaseService');
const Department = require('../models/Department');

class DepartmentService extends BaseService {
    constructor() {
        super(Department);
    }
}

module.exports = DepartmentService;