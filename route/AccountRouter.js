const express = require(`express`);
const router = express.Router();
const accountController = require(`../controller/AccountController`);
const parseMp = require('express-parse-multipart');

router.post(`/signup`,accountController.signup);

router.get(`/getUser/:id`,accountController.getUser);

router.get(`/getMyPost/:id`,accountController.getMyPost)

router.get(`/getMyDashboard/:id`,accountController.getMyDashboard)

router.put(`/edit`,accountController.edit);

router.put(`/changeThumbnail`,parseMp,accountController.changeThumbnail);

router.get(`/getMyInactivePost/:id`,accountController.getMyInactivePost);

router.get(`/getMyHistory/:id`,accountController.getMyHistory);

module.exports = router;
