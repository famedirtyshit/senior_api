const express = require(`express`);
const router = express.Router();
const postLostCatController = require(`../controller/PostLostCatController`);
const parseMp = require('express-parse-multipart');

router.post(`/post`,parseMp,postLostCatController.postLostCat);

router.put(`/update`,postLostCatController.updatePostLostCat);

router.put(`/addImage`,parseMp,postLostCatController.addImagePostLostCat);

router.put(`/deleteImage`,postLostCatController.deleteImagePostLostCat);

router.put(`/deletePost`,postLostCatController.deletePostLostCat);

router.post(`/sendEmailIdle`,postLostCatController.sendEmailIdle);

router.post(`/sendEmailInactive`,postLostCatController.sendEmailInactive);

router.post(`/sendEmailExpire`,postLostCatController.sendEmailExpire);

router.put(`/extendPost`,postLostCatController.extendPost);

module.exports = router;
