// services/BaseService.js
const { Sequelize, Op } = require("sequelize");
const { formatRelations } = require("../utils/formatRelations");
class BaseService {
    constructor(model) {
        this.model = model;
    }
 
    
    async getAll() {
        return this.model.findAll();
    }

    async getById(id, { count = [], relations = [] } = {}) {
        const attributes = { include: [] };
    
        // Thêm đếm số lượng (count)
        const safeCount = Array.isArray(count) ? count : [];
        safeCount.forEach(relation => {
            attributes.include.push([
                Sequelize.literal(`(
                    SELECT COUNT(*) FROM ${relation}
                    WHERE ${relation}.room_id = ${this.model.name}.id
                )`),
                `${relation}_count`
            ]);
        });
        
    
        // Nếu không có count, bỏ `attributes`
        const queryOptions = {
            include: relations // Dùng hàm format đã làm
        };
        if (attributes.include.length > 0) {
            queryOptions.attributes = attributes;
        }
    
        return this.model.findByPk(id, queryOptions);
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



    async paginate({ where, relations = [], order, limit, offset, count = [] }) {
        try {
            const attributes = { include: [] };
    
            // Thêm các thuộc tính đếm (count)
            const safeCount = Array.isArray(count) ? count : [];
                safeCount.forEach(relation => {
                    attributes.include.push([
                        Sequelize.literal(`(
                            SELECT COUNT(*) FROM ${relation}
                            WHERE ${relation}.room_id = ${this.model.name}.id
                        )`),
                        `${relation}_count`
                    ]);
                });

    
            // Xây dựng query
            const queryOptions = {
                where,
                include: relations, // Dùng hàm format để ánh xạ models đúng
                order,
                offset: parseInt(offset),
                limit: parseInt(limit) || 20,
            };
    
            // Chỉ thêm `attributes` nếu có count
            if (attributes.include.length > 0) {
                queryOptions.attributes = attributes;
            }
    
            return await this.model.findAndCountAll(queryOptions);
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
