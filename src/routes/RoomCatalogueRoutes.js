const express = require("express");
const RoomCatalogueController = require("../controllers/RoomCatalogueController");
const { storeRoomCatalogueValidator, updateRoomCatalogueValidator } = require("../validators/RoomCatalogueValidator");

const router = express.Router();

router.get("/", RoomCatalogueController.index);
router.get("/:id", RoomCatalogueController.show);
router.post("/", storeRoomCatalogueValidator, RoomCatalogueController.create);
router.patch("/:id", updateRoomCatalogueValidator, RoomCatalogueController.update);
router.delete("/:id", RoomCatalogueController.delete);

module.exports = router;
