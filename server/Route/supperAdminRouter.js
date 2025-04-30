const express = require('express')
const { addCategory } = require('../controller/supperAdmin/add.category')
const { getCategory } = require('../controller/supperAdmin/get.category')
const { adminLogin } = require('../controller/supperAdmin/login')
const { addAccount } = require('../controller/supperAdmin/addAccount')
const { addDepartment } = require('../controller/supperAdmin/add.dipartment')
const { getDepartment } = require('../controller/supperAdmin/get.department')
const { getStudents } = require('../controller/supperAdmin/get.students')
const { addTeachers } = require('../controller/supperAdmin/add.teachers')
const { deleteTeacher } = require('../controller/supperAdmin/delete.teacher')
const { getUntiteldSection } = require('../controller/supperAdmin/get.untitled.section')


const router = express.Router()

// posts

router.post('/add-category', addCategory)
router.post('/login', adminLogin)
router.post('/add-account', addAccount)
router.post('/add-department', addDepartment)
router.post('/add-teachers', addTeachers)

// gets
router.get('/get-category', getCategory)
router.get('/get-departments', getDepartment)
router.get('/get-student', getStudents)
router.get('/get-untiteld-section', getUntiteldSection)

// delete

router.delete('/delete-teacher/:id', deleteTeacher)

module.exports = router