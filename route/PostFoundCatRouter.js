const express = require(`express`);
const router = express.Router();
const postFoundCatController = require(`../controller/PostFoundCatController`);
const parseMp = require('express-parse-multipart');

router.post(`/post`,parseMp,postFoundCatController.postFoundCat);

router.put(`/update`,postFoundCatController.updatePostFoundCat);

router.put(`/addImage`,parseMp,postFoundCatController.addImagePostFoundCat);

router.put(`/deleteImage`,postFoundCatController.deleteImagePostFoundCat);

router.put(`/deletePost`,postFoundCatController.deletePostFoundCat);

module.exports = router;
