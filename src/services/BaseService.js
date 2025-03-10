class BaseService {
    constructor(model) {
        this.model = model;
    }

    async getAll() {
        return this.model.findAll();
    }

    async getById(id) {
        return this.model.findByPk(id);
    }

    async paginate(options) {
        return this.model.findAndCountAll(options);
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