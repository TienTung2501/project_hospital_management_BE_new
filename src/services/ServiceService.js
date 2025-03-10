// services/ServiceService.js
const Service = require("../models/Service");

class ServiceService {
    async getAll(filters = {}) {
        return await Service.findAll({ where: filters });
    }

    async getById(id) {
        return await Service.findByPk(id);
    }

    async create(data) {
        return await Service.create(data);
    }

    async update(id, data) {
        const service = await this.getById(id);
        if (!service) return null;
        return await service.update(data);
    }

    async delete(id) {
        const service = await this.getById(id);
        if (!service) return false;
        await service.destroy();
        return true;
    }
}

module.exports = new ServiceService();
