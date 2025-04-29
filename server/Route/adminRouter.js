const express = require('express')
const { addCategory } = require('../controller/supperAdmin/add.category')
const { getCategory } = require('../controller/supperAdmin/get.category')
const { adminLogin } = require('../controller/supperAdmin/login')
const { addAccount } = require('../controller/supperAdmin/addAccount')


const router = express.Router()

// admin post

router.post('/add-category', addCategory)
router.post('/login', adminLogin)
router.post('/add-account', addAccount)

// admin get
router.get('/get-category', getCategory)



module.exports = router