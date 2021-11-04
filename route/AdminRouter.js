const express = require(`express`);
const router = express.Router();
const adminController = require(`../controller/AdminController`);

router.get(`/checkAdmin/:id`,adminController.checkAdmin);

router.get(`/getReportPost/:id`,adminController.getReportPost);

router.post(`/rejectReportPost`,adminController.rejectReportPost);

router.post(`/deleteReportPost`,adminController.deleteReportPost);

module.exports = router;
