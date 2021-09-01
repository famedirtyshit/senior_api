const express = require(`express`);
const router = express.Router();
const searchFoundCatController = require(`../controller/SearchFoundCatController`);

router.get(`/get/:lat/:lng/:radius/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page/:sortType/:from/:to`,searchFoundCatController.searchFoundCat);

router.get(`/getAll/:male/:female/:unknow/:haveCollar/:notHaveCollar/:page/:from/:to`,searchFoundCatController.searchFoundCatNoMap);





module.exports = router;
