
const express = require('express')
const { teacherLogin } = require('../controller/teachers/login')

const router = express.Router()



router.post('/login', teacherLogin)


module.exports = router