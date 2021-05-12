const express = require(`express`);
const router = express.Router();
const postLostCatController = require(`../controller/PostLostCatController`);
const parseMp = require('express-parse-multipart');

router.post(`/post`,parseMp,postLostCatController.postLostCat);





module.exports = router;
