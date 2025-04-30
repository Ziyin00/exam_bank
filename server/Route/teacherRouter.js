
const express = require('express')
const { teacherLogin } = require('../controller/teachers/login')
const { addCourse } = require('../controller/teachers/addCours')
const { getAllComments } = require('../controller/teachers/get.comment')
const { updateTeacher } = require('../controller/teachers/update.profile')

const router = express.Router()


// post
router.post('/login', teacherLogin)
router.post('/add-cours', addCourse)

// get
router.get('/get-comment', getAllComments)

// update profile/edit profile
router.put('/edit-profile/:id', updateTeacher)


module.exports = router