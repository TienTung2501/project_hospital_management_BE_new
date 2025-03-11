const BaseService = require("./BaseService");
const RoomCatalogue = require("../models/RoomCatalogue");

class RoomCatalogueService extends BaseService{
  constructor() {
    super(RoomCatalogue);
}
}

module.exports = RoomCatalogueService;
