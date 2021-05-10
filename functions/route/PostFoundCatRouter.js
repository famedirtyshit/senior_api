const express = require(`express`);
const router = express.Router();
const postFoundCatController = require(`../controller/PostFoundCatController`);
let multer  = require('multer')
let storage = multer.memoryStorage()
let upload = multer({ storage: storage },{ dest: '.' })

router.post(`/post`,upload.any(),postFoundCatController.postFoundCat);





module.exports = router;
