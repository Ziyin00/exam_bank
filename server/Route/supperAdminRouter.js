const express = require('express')
const { addCategory } = require('../controller/supperAdmin/add.category')
const { getCategory } = require('../controller/supperAdmin/get.category')
const { addAccount } = require('../controller/supperAdmin/addAccount')
const { addDepartment } = require('../controller/supperAdmin/add.dipartment')
const { getDepartment } = require('../controller/supperAdmin/get.department')
const { getStudents } = require('../controller/supperAdmin/get.students')
const { addTeachers } = require('../controller/supperAdmin/add.teachers')
const { deleteTeacher } = require('../controller/supperAdmin/delete.teacher')
const { updateTeacher } = require('../controller/supperAdmin/edit.tacher')
const { deleteStudent } = require('../controller/supperAdmin/delete.student')
const { updateStudent } = require('../controller/supperAdmin/edit.student')
const { editAccount } = require('../controller/supperAdmin/edit.account')
const { getAccount } = require('../controller/supperAdmin/get.account')
const { getAllCourses } = require('../controller/supperAdmin/get.all.course')
const { getCourseRating } = require('../controller/supperAdmin/get.average.rating')
const { userLogin } = require('../controller/userLogin/login')


const router = express.Router()

// posts

router.post('/add-category', addCategory)
router.post('/login', userLogin)
router.post('/add-account', addAccount)
router.post('/add-department', addDepartment)
router.post('/add-teachers', addTeachers)

// gets
router.get('/get-category', getCategory)
router.get('/get-departments', getDepartment)
router.get('/get-student', getStudents)
router.get('/get-account', getAccount)
router.get('/get-all-course', getAllCourses)
router.get('/rating/:id', getCourseRating)

// delete
router.delete('/delete-teacher/:id', deleteTeacher)
router.delete('/delete-student/:id', deleteStudent)

// put
router.put('/edit-teacher/:id', updateTeacher)
router.put('/edit-student/:id', updateStudent)
router.put('/edit-account', editAccount);

module.exports = router