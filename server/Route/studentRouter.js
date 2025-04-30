const express = require('express')
const { studentSignUp } = require('../controller/student/sign.up')
const { studentLogin } = require('../controller/student/login')
const { getCoursesOnePerCategory } = require('../controller/student/getCours')

const router = express.Router()


router.post('/student-sign-up', studentSignUp)
router.post('/login', studentLogin)
router.get('/get-cours', getCoursesOnePerCategory)


module.exports = router