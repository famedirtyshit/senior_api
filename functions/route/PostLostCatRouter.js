const express = require(`express`);
const router = express.Router();
const postLostCatController = require(`../controller/PostLostCatController`);

router.post(`/post`,postLostCatController.postLostCat);





module.exports = router;
