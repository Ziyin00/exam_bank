const express = require('express')
const { studentSignUp } = require('../controller/student/sign.up')
const { studentLogin } = require('../controller/student/login')

const router = express.Router()


router.post('/student-sign-up', studentSignUp)
router.post('/login', studentLogin)


module.exports = router