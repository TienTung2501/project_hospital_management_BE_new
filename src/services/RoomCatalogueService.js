const RoomCatalogue = require("../models/RoomCatalogue");

class RoomCatalogueService {
  async getAll(keyword, status, limit = 10) {
    const whereClause = {};
    if (status !== undefined) whereClause.status = status;
    if (keyword) whereClause.name = { [Op.like]: `%${keyword}%` };

    return await RoomCatalogue.findAll({ where: whereClause, limit, order: [["id", "DESC"]] });
  }

  async getById(id) {
    return await RoomCatalogue.findByPk(id, { include: ["rooms"] });
  }

  async create(data) {
    return await RoomCatalogue.create(data);
  }

  async update(id, data) {
    const roomCatalogue = await RoomCatalogue.findByPk(id);
    if (!roomCatalogue) return null;
    return await roomCatalogue.update(data);
  }

  async delete(id) {
    const roomCatalogue = await RoomCatalogue.findByPk(id);
    if (!roomCatalogue) return false;
    await roomCatalogue.destroy();
    return true;
  }
}

module.exports = new RoomCatalogueService();
