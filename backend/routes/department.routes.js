const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/department.controller.js");

// ========== PERFORMANCE ROUTES (MUST BE BEFORE :id ROUTES) ==========
router.get("/performance/all", ctrl.getPerformances);
router.post("/performance", ctrl.createPerformance);
router.put("/performance/:id", ctrl.updatePerformance);
router.delete("/performance/:id", ctrl.deletePerformance);

// ========== ALLOCATION ROUTES (MUST BE BEFORE :id ROUTES) ==========
router.get("/allocation/all", ctrl.getAllocations);
router.post("/allocation", ctrl.createAllocation);
router.put("/allocation/:id", ctrl.updateAllocation);
router.delete("/allocation/:id", ctrl.deleteAllocation);

// ========== STATUS ROUTES (MUST BE BEFORE :id ROUTES) ==========
router.get("/status/all", ctrl.getStatuses);
router.get("/status/department/:departmentId", ctrl.getStatusesByDepartment); // New route
router.post("/status", ctrl.createStatus);
router.put("/status/:id", ctrl.updateStatus);
router.delete("/status/:id", ctrl.deleteStatus);

// ========== DEPARTMENT ROUTES (GENERIC :id ROUTES AT END) ==========
router.get("/", ctrl.getDepartments);
router.post("/", ctrl.createDepartment);
router.get("/:id", ctrl.getDepartmentById);
router.put("/:id", ctrl.updateDepartment);
router.delete("/:id", ctrl.deleteDepartment);

module.exports = router;