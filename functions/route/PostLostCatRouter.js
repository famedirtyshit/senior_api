const express = require(`express`);
const router = express.Router();
const postLostCatController = require(`../controller/PostLostCatController`);
let multer  = require('multer')
let storage = multer.memoryStorage()
let upload = multer({ storage: storage },{ dest: '.' })

router.post(`/post`,upload.any(),postLostCatController.postLostCat);





module.exports = router;
