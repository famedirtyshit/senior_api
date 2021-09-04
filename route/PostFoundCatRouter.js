const express = require(`express`);
const router = express.Router();
const postFoundCatController = require(`../controller/PostFoundCatController`);
const parseMp = require('express-parse-multipart');

router.post(`/post`,parseMp,postFoundCatController.postFoundCat);

module.exports = router;
