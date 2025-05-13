
const express = require('express')
const { addCourse } = require('../controller/teachers/addCours')
const { getAllComments } = require('../controller/teachers/get.comment')
const { updateTeacher } = require('../controller/teachers/update.profile')
const { answerQuestion } = require('../controller/teachers/answer.quation')
const { getCourseQA } = require('../controller/teachers/getCoursQA')
const { postExams } = require('../controller/teachers/add.exams')
const { getAllExams } = require('../controller/teachers/get.exams')
const { editCourse } = require('../controller/teachers/edit.cours')
const { deleteCourse } = require('../controller/teachers/delete.cours')
const { editExam } = require('../controller/teachers/edit.exam')
const { deleteExam } = require('../controller/teachers/delete.exams')
const { getAllQuestionsCount } = require('../controller/teachers/quation.count')
const { getAllCourses } = require('../controller/teachers/get.all.course')
const { getCourseRating } = require('../controller/teachers/get.average.rating')
const { userLogin } = require('../controller/userLogin/login')
const { getTeacherProfile } = require('../controller/teachers/get.teacher.profile')

const router = express.Router()


// post
router.post('/login', userLogin)
router.post('/add-cours', addCourse)
router.post('/answer-quation', answerQuestion)
router.post('/post-exams', postExams)

// get
router.get('/get-comment', getAllComments)
router.get('/get-QA/:id', getCourseQA)
router.get('/get-exams', getAllExams)
router.get('/get-quations-count', getAllQuestionsCount)  //this for count message    you accpt like this total
router.get('/get-all-course', getAllCourses)
router.get('/rating/:id', getCourseRating)
router.get('/get-profile', getTeacherProfile)

// update profile/edit profile
router.put('/edit-profile', updateTeacher)
router.put('/edit-course/:id', editCourse);
router.put('/edit-exam/:id', editExam)

// delete cours
router.delete('/delete-course/:id', deleteCourse);
router.delete('/delete-exam/:id', deleteExam)



module.exports = router