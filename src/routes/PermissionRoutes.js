const express = require("express");
const {index,show,create,update,remove} = require("../controllers/PermissionController");
const { storePermissionValidator, updatePermissionValidator } = require("../validators/PermissionValidator");

const router = express.Router();

router.get("/", index);
router.get("/:id", show);
router.post("/create", storePermissionValidator, create);
router.patch("/:id", updatePermissionValidator, update);
router.delete("/:id", remove);

module.exports = router;
