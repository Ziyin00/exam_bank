const express = require('express')
const { studentSignUp } = require('../controller/student/sign.up')
const { studentLogin } = require('../controller/student/login')
const { getCoursesOnePerCategory } = require('../controller/student/getCours')
const { getDetailCours } = require('../controller/student/get.detail.course')
const { giveComment } = require('../controller/student/give.comment')
const { updateStudent } = require('../controller/supperAdmin/edit.student')
const { askQuestion } = require('../controller/student/askQuation')
const { getStudentCourseQA } = require('../controller/student/get.quation.answer')
const { getStudentAnswerCount } = require('../controller/student/get.answer.count')

const router = express.Router()

// post
router.post('/student-sign-up', studentSignUp)
router.post('/login', studentLogin)
router.post('/give-comment', giveComment)
router.post('/ask-quation', askQuestion)

// put(update student)
router.put('/edit-profile/:id', updateStudent)



// get
router.get('/count-answer', getStudentAnswerCount)   //you accept like answer_count
router.get('/get-cours', getCoursesOnePerCategory)
router.get('/get-detail-course/:id', getDetailCours)
router.get('/get-quation-answer/:id', getStudentCourseQA)

module.exports = router