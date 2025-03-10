const RoomService = require("../services/RoomService");

class RoomController {
  async index(req, res) {
    try {
      const { keyword, status, limit = 10 } = req.query;
      const condition = {};
      if (status) condition.status = status;
      const rooms = await RoomService.paginate(["id", "code", "status", "room_catalogue_id", "department_id", "status_bed", "created_at", "updated_at"], 
        condition, 
        ["department", "roomCatalogue", "users", "beds"], 
        ["code"], 
        keyword, 
        ["id", "DESC"], 
        limit
      );
      res.status(rooms.length ? 200 : 204).json({ status: rooms.length ? 200 : 204, message: rooms.length ? "success" : "No Data", data: rooms });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Server Error", error: error.message });
    }
  }

  async show(req, res) {
    try {
      const room = await RoomService.getById(req.params.id, ["beds"], ["users"]);
      if (!room) return res.status(404).json({ status: 404, title: "Not Found" });
      res.json({ status: 200, title: "success", data: room });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Server Error", error: error.message });
    }
  }

  async create(req, res) {
    try {
      const room = await RoomService.create(req.body);
      res.status(201).json({ status: 201, message: "created", data: room });
    } catch (error) {
      res.status(500).json({ status: 500, message: "server error", error: error.message });
    }
  }

  async update(req, res) {
    try {
      const room = await RoomService.update(req.params.id, req.body);
      if (!room) return res.status(404).json({ status: 404, title: "Not Found" });
      res.json({ status: 200, title: "success", data: room });
    } catch (error) {
      res.status(500).json({ status: 500, message: "server error", error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const flag = await RoomService.delete(req.params.id);
      res.status(flag ? 204 : 404).json({ status: flag ? 204 : 404, message: flag ? "success" : "error" });
    } catch (error) {
      res.status(500).json({ status: 500, message: "server error", error: error.message });
    }
  }
}

module.exports = new RoomController();
