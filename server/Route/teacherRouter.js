
const express = require('express')
const { teacherLogin } = require('../controller/teachers/login')
const { addCourse } = require('../controller/teachers/addCours')
const { getAllComments } = require('../controller/teachers/get.comment')
const { updateTeacher } = require('../controller/teachers/update.profile')
const { answerQuestion } = require('../controller/teachers/answer.quation')
const { getCourseQA } = require('../controller/teachers/getCoursQA')
const { postExams } = require('../controller/teachers/add.exams')
const { getAllExams } = require('../controller/teachers/get.exams')

const router = express.Router()


// post
router.post('/login', teacherLogin)
router.post('/add-cours', addCourse)
router.post('/answer-quation', answerQuestion)
router.post('/post-exams', postExams)

// get
router.get('/get-comment', getAllComments)
router.get('/get-QA/:id', getCourseQA)
router.get('/get-exams', getAllExams)

// update profile/edit profile
router.put('/edit-profile', updateTeacher)


module.exports = router