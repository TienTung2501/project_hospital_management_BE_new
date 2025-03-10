// controllers/ServiceController.js
const serviceService = require("../services/ServiceService");

class ServiceController {
    async index(req, res) {
        try {
            const { keyword, status, limit = 10 } = req.query;
            let filters = {};
            if (status) filters.status = status;
            const services = await serviceService.getAll(filters);

            if (services.length) {
                res.status(200).json({ status: 200, message: "success", data: services });
            } else {
                res.status(204).json({ status: 204, message: "No Data" });
            }
        } catch (error) {
            res.status(500).json({ status: 500, message: "Server Error", error });
        }
    }

    async show(req, res) {
        try {
            const service = await serviceService.getById(req.params.id);
            if (!service) {
                return res.status(404).json({ status: 404, title: "Not Found" });
            }
            res.status(200).json({ status: 200, title: "success", data: service });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Server Error", error });
        }
    }

    async create(req, res) {
        try {
            const service = await serviceService.create(req.body);
            res.status(201).json({ status: 201, message: "created", data: service });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Server Error", error });
        }
    }

    async update(req, res) {
        try {
            const service = await serviceService.update(req.params.id, req.body);
            if (!service) {
                return res.status(404).json({ status: 404, title: "Not Found" });
            }
            res.status(200).json({ status: 200, title: "success", data: service });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Server Error", error });
        }
    }

    async delete(req, res) {
        try {
            const deleted = await serviceService.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ status: 404, message: "error" });
            }
            res.status(204).json({ status: 204, message: "success" });
        } catch (error) {
            res.status(500).json({ status: 500, message: "Server Error", error });
        }
    }
}

module.exports = new ServiceController();
