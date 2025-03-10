const RoomCatalogueService = require("../services/RoomCatalogueService");

class RoomCatalogueController {
  async index(req, res) {
    const { keyword, status, limit } = req.query;
    const roomCatalogues = await RoomCatalogueService.getAll(keyword, Number(status), Number(limit));

    return res.status(roomCatalogues.length ? 200 : 204).json({
      status: roomCatalogues.length ? 200 : 204,
      message: roomCatalogues.length ? "success" : "No Data",
      data: roomCatalogues,
    });
  }

  async show(req, res) {
    const { id } = req.params;
    const roomCatalogue = await RoomCatalogueService.getById(Number(id));

    if (!roomCatalogue) {
      return res.status(404).json({ status: 404, message: "Not Found" });
    }

    return res.status(200).json({ status: 200, message: "success", data: roomCatalogue });
  }

  async create(req, res) {
    const roomCatalogue = await RoomCatalogueService.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "created",
      data: roomCatalogue,
    });
  }

  async update(req, res) {
    const { id } = req.params;
    const roomCatalogue = await RoomCatalogueService.update(Number(id), req.body);

    if (!roomCatalogue) {
      return res.status(404).json({ status: 404, message: "Not Found" });
    }

    return res.status(200).json({ status: 200, message: "success", data: roomCatalogue });
  }

  async delete(req, res) {
    const { id } = req.params;
    const deleted = await RoomCatalogueService.delete(Number(id));

    return res.status(deleted ? 204 : 404).json({
      status: deleted ? 204 : 404,
      message: deleted ? "success" : "error",
    });
  }
}

module.exports = new RoomCatalogueController();
