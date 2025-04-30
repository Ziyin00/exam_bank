const express = require('express')
const { studentSignUp } = require('../controller/student/sign.up')
const { studentLogin } = require('../controller/student/login')
const { getCoursesOnePerCategory } = require('../controller/student/getCours')
const { getDetailCours } = require('../controller/student/get.detail.course')
const { giveComment } = require('../controller/student/give.comment')

const router = express.Router()


router.post('/student-sign-up', studentSignUp)
router.post('/login', studentLogin)
router.post('/give-comment', giveComment)



router.get('/get-cours', getCoursesOnePerCategory)
router.get('/get-detail-course/:id', getDetailCours)



module.exports = router