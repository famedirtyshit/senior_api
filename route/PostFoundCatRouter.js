const express = require(`express`);
const router = express.Router();
const postFoundCatController = require(`../controller/PostFoundCatController`);
const parseMp = require('express-parse-multipart');

router.post(`/post`,parseMp,postFoundCatController.postFoundCat);


// router.get('/testdelete',postFoundCatController.testdelete)

// router.get('/testcheck',postFoundCatController.testCheck);

module.exports = router;
