// services/BaseService.js
const { Op } = require("sequelize");

class BaseService {
    constructor(model) {
        this.model = model;
    }

    async getAll() {
        return this.model.findAll();
    }

    async getById(id, options = {}) {
        return this.model.findByPk(id, options);
    }

    async getHistory(id, relations = {}) {
        const include = Object.keys(relations).map(key => {
            return {
                association: key,
                include: relations[key].map(subRelation => ({ association: subRelation })),
                where: key === 'medicalRecords' ? { diagnosis: { [Op.ne]: null } } : undefined
            };
        });
        return this.model.findByPk(id, { include });
    }



    async paginate({ where, include, order, limit,offset }) {
        try {
            // Truy vấn dữ liệu với phân trang
            return this.model.findAndCountAll({
                where,
                include,
                order,
                offset:parseInt(offset),
                limit: parseInt(limit) || 20,
            });
        } catch (error) {
            console.error("Error in paginate:", error);
            throw new Error("Database query failed");
        }
    }
    async create(payload) {
        return this.model.create(payload);
    }

    async update(id, payload) {
        const instance = await this.model.findByPk(id);
        if (instance) {
            return instance.update(payload);
        }
        return null;
    }

    async delete(id) {
        const instance = await this.model.findByPk(id);
        if (instance) {
            await instance.destroy();
            return true;
        }
        return false;
    }
}

module.exports = BaseService;
