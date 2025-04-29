const express = require('express')
const { addCategory } = require('../controller/supperAdmin/add.category')
const { getCategory } = require('../controller/supperAdmin/get.category')


const router = express.Router()


router.post('/add-category', addCategory)
router.get('/get-category', getCategory)




module.exports = router