const express = require(`express`);
const router = express.Router();
const searchLostCatController = require(`../controller/SearchLostCatController`);

router.get(`/get/:lat/:lng/:radius/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page/:sortType`,searchLostCatController.searchLostCat);

router.get(`/getAll/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page`,searchLostCatController.searchLostCatNoMap);




module.exports = router;
