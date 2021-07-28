const express = require(`express`);
const router = express.Router();
const searchLostCatController = require(`../controller/SearchLostCatController`);

router.get(`/get/:district/:sex/:collar`,searchLostCatController.searchLostCat);





module.exports = router;
