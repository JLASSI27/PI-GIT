const express = require('express');
const router = express.Router();
const taskController = require('../../Controllers/Workshop/taskController');
const isUser = require('../../Middlewares/User/isUser.middleware');

router.post('/', isUser, taskController.createTask);
router.get('/workshop/:workshopId', isUser, taskController.getTasks);

module.exports = router;