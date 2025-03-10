const BaseService = require("./BaseService");
const Room = require("../models/Room");

class RoomService extends BaseService {
  constructor() {
    super(Room);
  }
}

module.exports = new RoomService();
