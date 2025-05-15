// task.routes.js
const express = require('express');
const router = express.Router();
const taskController = require('../../Controllers/Workshop/taskController');
const isUser = require('../../Middlewares/User/isUser.middleware');
const isAdmin = require('../../Middlewares/User/isAdmin.middleware');

router.get('/workshop/:workshopId/admin', isAdmin, taskController.getTasksByWorkshop);
router.get('/workshop/:workshopId/user', isUser, taskController.getTasksByWorkshopForUser);
router.post('/', isAdmin, taskController.createTask);
router.get('/:id', isAdmin, taskController.getTaskById);
router.put('/:id', isAdmin, taskController.updateTask);
router.delete('/:id', isAdmin, taskController.deleteTask);

module.exports = router;