const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/user.controller.js");

router.get("/", ctrl.getUsers);
router.get("/:id", ctrl.getUserById);

module.exports = router;
