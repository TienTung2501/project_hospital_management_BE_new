const Position = require('../models/Position');

class PositionService  {
  async create(data) {
    return await Position.create(data);
  }

  async getById(id) {
    return await Position.findByPk(id);
  }

  async update(id, data) {
    const position = await Position.findByPk(id);
    if (!position) return null;
    return await position.update(data);
  }

  async delete(id) {
    return await Position.destroy({ where: { id } });
  }

  async paginate({ where = {}, limit = 10, offset = 0 }) {
    return await Position.findAndCountAll({ where, limit, offset });
  }
}

module.exports = new PositionService();
