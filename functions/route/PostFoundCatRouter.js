const express = require(`express`);
const router = express.Router();
const postFoundCatController = require(`../controller/PostFoundCatController`);

router.post(`/post`,postFoundCatController.postFoundCat);





module.exports = router;
