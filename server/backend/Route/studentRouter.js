const express = require('express')
const { studentSignUp } = require('../controller/student/sign.up');
const { getCoursesById } = require('../controller/student/getCours')
const { giveComment } = require('../controller/student/give.comment')
const { updateStudent } = require('../controller/supperAdmin/edit.student')
const { askQuestion } = require('../controller/student/askQuation')
const { getStudentCourseQA } = require('../controller/student/get.quation.answer')
const { getStudentAnswerCount } = require('../controller/student/get.answer.count')
const { getAllCourses } = require('../controller/student/get.all.course')
const { getCoursesByYear } = require('../controller/student/get.coursByYear')
const { rateCourse } = require('../controller/student/reating')
const { getCourseRating } = require('../controller/student/get.average.reating');
const { userLogin } = require('../controller/userLogin/login');
const { studentUpdate } = require('../controller/student/update.profile');

const router = express.Router()

router.use(express.json());

// post
router.post('/student-sign-up', studentSignUp)
router.post('/login', userLogin)
router.post('/give-comment', giveComment)
router.post('/ask-quation', askQuestion)
router.post('/rateing', rateCourse)

// put(update student)
router.put('/edit-profile', studentUpdate)



// get
router.get('/count-answer', getStudentAnswerCount)   //you accept  answer_count
router.get('/get-cours/:id', getCoursesById) //to get detail about course
router.get('/get-quation-answer/:id', getStudentCourseQA)
router.get('/get-all-course', getAllCourses)
router.get('/get-course-by-year/:year', getCoursesByYear)
router.get('/rating/:id', getCourseRating)

module.exports = router