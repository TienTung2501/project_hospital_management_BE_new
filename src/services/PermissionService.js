const BaseService = require('./BaseService');
const Permission = require('../models/Permission');

class PermissionService extends BaseService {
    constructor() {
        super(Permission);
    }
}

module.exports = PermissionService;