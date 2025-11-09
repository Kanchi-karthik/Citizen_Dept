const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/feedback.controller");
router.get("/", ctrl.getFeedbacks);
module.exports = router;
