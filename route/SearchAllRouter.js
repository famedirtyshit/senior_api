const express = require(`express`);
const router = express.Router();
const searchAllController = require(`../controller/SearchAllController`);

router.get(`/get/:lat/:lng/:radius/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page/:sortType`,searchAllController.searchAll);

router.get(`/getAll/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page`,searchAllController.searchAllNoMap);





module.exports = router;
