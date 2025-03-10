const MedicationCatalogueService = require('../services/MedicationCatalogueService');

class MedicationCatalogueController {
    async index(req, res) {
        const { keyword, status, limit } = req.query;
        const result = await MedicationCatalogueService.getAll(keyword, status, limit);
        if (result.length) {
            return res.status(200).json({ status: 200, message: 'success', data: result });
        }
        return res.status(204).json({ status: 204, message: 'No Data', data: [] });
    }

    async show(req, res) {
        const id = req.params.id;
        const result = await MedicationCatalogueService.getById(id);
        if (!result) {
            return res.status(404).json({ status: 404, title: 'Not Found' });
        }
        return res.status(200).json({ status: 200, title: 'success', data: result });
    }

    async create(req, res) {
        try {
            const data = req.body;
            const result = await MedicationCatalogueService.create(data);
            return res.status(201).json({ status: 201, message: 'created', data: result });
        } catch (error) {
            return res.status(500).json({ status: 500, message: 'server error', error: error.message });
        }
    }

    async update(req, res) {
        const id = req.params.id;
        const data = req.body;
        const result = await MedicationCatalogueService.update(id, data);
        if (!result) {
            return res.status(404).json({ status: 404, title: 'Not Found' });
        }
        return res.status(200).json({ status: 200, title: 'success', data: result });
    }

    async delete(req, res) {
        const id = req.params.id;
        const success = await MedicationCatalogueService.delete(id);
        if (!success) {
            return res.status(404).json({ status: 404, message: 'error' });
        }
        return res.status(204).json({ status: 204, message: 'success' });
    }
}

module.exports = new MedicationCatalogueController();
