const MedicationCatalogue = require('../models/MedicationCatalogue');

class MedicationCatalogueService {
    async getAll(keyword = '', status = null, limit = 10) {
        const whereCondition = {};
        if (status !== null) whereCondition.status = status;
        if (keyword) whereCondition.name = { [Op.like]: `%${keyword}%` };

        return await MedicationCatalogue.findAll({
            where: whereCondition,
            limit,
            order: [['_lft', 'ASC']],
        });
    }

    async getById(id) {
        return await MedicationCatalogue.findByPk(id);
    }

    async create(data) {
        return await MedicationCatalogue.create(data);
    }

    async update(id, data) {
        const item = await MedicationCatalogue.findByPk(id);
        if (!item) return null;
        return await item.update(data);
    }

    async delete(id) {
        const item = await MedicationCatalogue.findByPk(id);
        if (!item) return false;
        await item.destroy();
        return true;
    }
}

module.exports = new MedicationCatalogueService();
