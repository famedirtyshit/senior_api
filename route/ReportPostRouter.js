const express = require(`express`);
const router = express.Router();
const reportPostController = require(`../controller/ReportPostController`);

router.post(`/report`, reportPostController.report);

module.exports = router;
