const express = require(`express`);
const router = express.Router();
const searchFoundCatController = require(`../controller/SearchFoundCatController`);

router.get(`/get/:district/:sex/:collar`,searchFoundCatController.searchFoundCat);





module.exports = router;
