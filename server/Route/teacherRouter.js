
const express = require('express')
const { teacherLogin } = require('../controller/teachers/login')
const { addCourse } = require('../controller/teachers/addCours')
const { getAllComments } = require('../controller/teachers/get.comment')

const router = express.Router()



router.post('/login', teacherLogin)
router.post('/add-cours', addCourse)

router.get('/get-comment', getAllComments)


module.exports = router