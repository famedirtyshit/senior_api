const express = require(`express`);
const router = express.Router();
const accountController = require(`../controller/AccountController`);

router.post(`/signup`,accountController.signup);

router.get(`/getUser/:id`,accountController.getUser);

router.get(`/getMyPost/:id`,accountController.getMyPost)

module.exports = router;
