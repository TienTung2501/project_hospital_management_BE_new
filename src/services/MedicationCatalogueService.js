const { Sequelize, Op } = require("sequelize");
const MedicationCatalogue = require("../models/MedicationCatalogue");
const BaseService = require("./BaseService");

class MedicationCatalogueService extends BaseService {
    constructor() {
        super(MedicationCatalogue);
    }

    async create(data) {
        const medicationCatalogue = await super.create(data);
        await this.rebuildTree();
        return medicationCatalogue;
    }

    async update(id, data) {
        const updated = await super.update(id, data);
        await this.rebuildTree();
        return updated;
    }

    async delete(id) {
        const deleted = await super.delete(id);
        await this.rebuildTree();
        return deleted;
    }

    async rebuildTree() {
        const transaction = await MedicationCatalogue.sequelize.transaction();

        try {
            const categories = await MedicationCatalogue.findAll({
                order: [["parent_id", "ASC"], ["id", "ASC"]],
                transaction
            });

            let left = 1;
            const updates = [];
            const categoryMap = new Map();
            categories.forEach(category => categoryMap.set(category.id, { ...category.get(), children: [] }));
            
            categories.forEach(category => {
                if (category.parent_id && categoryMap.has(category.parent_id)) {
                    categoryMap.get(category.parent_id).children.push(categoryMap.get(category.id));
                }
            });
   
            const updateNodes = (node, level = 0) => {
                node.lft = left++;
                node.level = level;
                node.children.forEach(child => updateNodes(child, level + 1));
                node.rgt = left++;
                updates.push(node);
            };

            categoryMap.forEach(category => {
                if (!category.parent_id) updateNodes(category);
            });

            await MedicationCatalogue.bulkCreate(updates, { updateOnDuplicate: ["lft", "rgt", "level"], transaction });
            await transaction.commit();
            console.log("Tree structure updated successfully!");
        } catch (error) {
            await transaction.rollback();
            console.error("Error updating tree structure:", error);
        }
    }
}

module.exports = new MedicationCatalogueService();