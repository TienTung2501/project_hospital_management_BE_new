const ServiceCatalogue = require("../models/ServiceCatalogue");

class ServiceCatalogueService   {
    async getAll(filters = {}) {
        return await ServiceCatalogue.findAll({ where: filters });
    }

    async getById(id) {
        return await ServiceCatalogue.findByPk(id);
    }

    async create(data) {
        return await ServiceCatalogue.create(data);
    }

    async update(id, data) {
        const serviceCatalogue = await this.getById(id);
        if (!serviceCatalogue) return null;
        return await serviceCatalogue.update(data);
    }

    async delete(id) {
        const serviceCatalogue = await this.getById(id);
        if (!serviceCatalogue) return false;
        await serviceCatalogue.destroy();
        return true;
    }
}

module.exports = new ServiceCatalogueService();
