const BaseService = require('./BaseService');
const Position = require('../models/Position');

class PositionService extends BaseService {
    constructor() {
        super(Position);
    }
}

module.exports = PositionService;