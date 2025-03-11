const express = require("express");
const RoomController = require("../controllers/RoomController");
const { validateRoomCreate, validateRoomUpdate } = require("../validators/RoomValidator");

const router = express.Router();

router.get("/", RoomController.index);
router.get("/:id", RoomController.show);
router.post("/create", validateRoomCreate, RoomController.create);
router.patch("/:id", validateRoomUpdate, RoomController.update);
router.delete("/:id", RoomController.delete);

module.exports = router;
