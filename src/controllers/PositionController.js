const PositionService = require('../services/PositionService');

class PositionController {
  async index(req, res) {
    try {
      const { keyword, status, limit = 10, page = 1 } = req.query;
      const where = {};
      if (status !== undefined) where.status = status;
      if (keyword) where.name = { [Op.like]: `%${keyword}%` };

      const offset = (page - 1) * limit;
      const positions = await PositionService.paginate({ where, limit, offset });

      res.json({
        status: positions.count ? 200 : 204,
        message: positions.count ? 'success' : 'No Data',
        data: positions,
      });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Server Error' });
    }
  }

  async show(req, res) {
    try {
      const position = await PositionService.getById(req.params.id);
      if (!position) return res.status(404).json({ status: 404, message: 'Not Found' });

      res.json({ status: 200, message: 'success', data: position });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Server Error' });
    }
  }

  async create(req, res) {
    try {
      const position = await PositionService.create(req.body);
      res.status(201).json({ status: 201, message: 'created', data: position });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Server Error' });
    }
  }

  async update(req, res) {
    try {
      const position = await PositionService.update(req.params.id, req.body);
      if (!position) return res.status(404).json({ status: 404, message: 'Not Found' });

      res.json({ status: 200, message: 'success', data: position });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Server Error' });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await PositionService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ status: 404, message: 'Not Found' });

      res.status(204).json({ status: 204, message: 'success' });
    } catch (error) {
      res.status(500).json({ status: 500, message: 'Server Error' });
    }
  }
}

module.exports = new PositionController();
