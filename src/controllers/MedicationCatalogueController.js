const medicationCatalogueService = require('../services/MedicationCatalogueService');

const { Op } = require("sequelize");

class MedicationCatalogueController {
    async index(req, res) {
        try {
            const { keyword, status,exclude_id  } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (status) whereCondition.status = status;
            if (keyword) {
                whereCondition[Op.or] = [
                    { name: { [Op.like]: `%${keyword}%` } },
                    { description: { [Op.like]: `%${keyword}%` } },
                ];
            }
            if (exclude_id) {
                whereCondition.id = { [Op.ne]: Number(exclude_id) };
            }
            const options = {
                where: whereCondition,
                limit,
                offset,
                order: [['name', 'ASC'], ['lft', 'ASC']]
            };

            const medicationCatalogues = await medicationCatalogueService.paginate(options)
            const totalPages = Math.ceil(medicationCatalogues.count / limit);

            if (medicationCatalogues.rows.length > 0) {
                return res.status(200).json({
                    status: 200,
                    message: 'Success',
                    data: {
                        data:medicationCatalogues.rows,
                        current_page: page,
                        first_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=1`,
                        from: offset + 1,
                        last_page: totalPages,
                        last_page_url: `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${totalPages}`,
                        next_page_url: page < totalPages ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page + 1}` : null,
                        prev_page_url: page > 1 ? `${req.protocol}://${req.get("host")}${req.baseUrl}?page=${page - 1}` : null,
                        path: `${req.protocol}://${req.get("host")}${req.baseUrl}`,
                        per_page: limit,
                        to: offset + medicationCatalogues.rows.length,
                        total: medicationCatalogues.count,
                    }
                });
            } 
            else {
                return res.status(204).json({
                    status: 204,
                    message: 'No Data',
                });
              }
        } 
        catch (error) {
            console.error('Error in index:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params;
            const medicationCatalogue = await medicationCatalogueService.getById(id);

            if (!medicationCatalogue) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }

            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: medicationCatalogue }
            });
        } catch (error) {
            console.error('Error in show:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async create(req, res) {
        try {
            const medicationCatalogue = await medicationCatalogueService.create(req.body);
            return res.status(200).json({
                status: 200,
                message: 'Created',
                data: { data: medicationCatalogue }
            });
        } catch (error) {
            console.error('Error in create:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const medicationCatalogue = await medicationCatalogueService.getById(id);
            if (!medicationCatalogue) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            const updatedMedicationCatalogue = await medicationCatalogueService.update(id, req.body);
            return res.status(200).json({
                status: 200,
                message: 'Success',
                data: { data: updatedMedicationCatalogue }
            });
        } catch (error) {
            console.error('Error in update:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }

    async remove(req, res) {
        try {
            const { id } = req.params;
            const success = await medicationCatalogueService.delete(id);
            if (!success) {
                return res.status(404).json({ status: 404, message: 'Not Found' });
            }
            return res.status(200).send();
        } catch (error) {
            console.error('Error in delete:', error);
            return res.status(500).json({ status: 500, message: 'Server Error' });
        }
    }
}

module.exports = new MedicationCatalogueController();