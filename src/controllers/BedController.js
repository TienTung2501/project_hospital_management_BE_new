const bedService = require('../services/bedService');
const { validationResult } = require('express-validator');

const getFields = () => [
    'id', 'code', 'price', 'status', 'room_id', 'patient_id', 'createdAt', 'updatedAt'
];

exports.index = async (req, res) => {
    try {
        const { keyword, status, limit = 10 } = req.query;
        const condition = status ? { status } : {};
        const beds = await bedService.paginate(getFields(), condition, ['room', 'patient'], ['code'], keyword, [['id', 'DESC']], limit);

        if (beds.count) {
            return res.status(200).json({ status: 200, message: 'success', data: beds });
        }
        return res.status(204).json({ status: 204, message: 'No Data' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Server error', error });
    }
};

exports.show = async (req, res) => {
    try {
        const { id } = req.params;
        const bed = await bedService.getById(id, [], ['room', 'patient']);

        if (bed) {
            return res.status(200).json({ status: 200, message: 'success', data: bed });
        }
        return res.status(404).json({ status: 404, message: 'Not Found' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Server error', error });
    }
};

exports.create = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: 'Validation error', errors: errors.array() });
    }

    try {
        const bed = await bedService.create(req.body);
        if (bed.id) {
            return res.status(201).json({ status: 201, message: 'created', data: bed });
        }
        return res.status(500).json({ status: 500, message: 'Server error' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Server error', error });
    }
};

exports.update = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, message: 'Validation error', errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const bed = await bedService.getById(id);
        if (!bed) {
            return res.status(404).json({ status: 404, message: 'Not Found' });
        }

        const updatedBed = await bedService.update(id, req.body);
        return res.status(200).json({ status: 200, message: 'success', data: updatedBed });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Server error', error });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const isDeleted = await bedService.delete(id);

        if (isDeleted) {
            return res.status(204).json({ status: 204, message: 'success' });
        }
        return res.status(404).json({ status: 404, message: 'error' });
    } catch (error) {
        return res.status(500).json({ status: 500, message: 'Server error', error });
    }
};
