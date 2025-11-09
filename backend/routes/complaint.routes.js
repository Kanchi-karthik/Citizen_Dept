const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/complaint.controller");

router.get("/", ctrl.getComplaints);
router.post("/", ctrl.createComplaint);
router.get("/:id/details", ctrl.getComplaintDetails);
router.put("/:id/status", ctrl.updateComplaintStatus);
router.post("/:id/resolution-update", ctrl.addComplaintResolutionUpdate);
router.get("/:id/resolution-updates", ctrl.getComplaintResolutionUpdates);

module.exports = router;