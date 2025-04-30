
const express = require('express')
const { teacherLogin } = require('../controller/teachers/login')
const { addCourse } = require('../controller/teachers/addCours')

const router = express.Router()



router.post('/login', teacherLogin)
router.post('/add-cours', addCourse)


module.exports = router