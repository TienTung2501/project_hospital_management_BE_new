const express = require("express");
const {index,show,create,update,remove} = require("../controllers/RoomCatalogueController");
const { storeRoomCatalogueValidator, updateRoomCatalogueValidator } = require("../validators/RoomCatalogueValidator");

const router = express.Router();

router.get("/", index);
router.get("/:id", show);
router.post("/create", storeRoomCatalogueValidator, create);
router.patch("/:id", updateRoomCatalogueValidator, update);
router.delete("/:id", remove);

module.exports = router;
