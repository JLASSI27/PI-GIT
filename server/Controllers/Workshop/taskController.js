// taskController.js
const Task = require('../../Models/workshop/Task');
const Workshop = require('../../Models/workshop/Workshop');
const Enrollment = require('../../Models/workshop/Enrollment');

// Get tasks by workshop ID for admin (no enrollment check)
exports.getTasksByWorkshop = async (req, res, next) => {
    try {
        const { workshopId } = req.params;

        // Check if workshop exists
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop not found',
            });
        }

        console.log('req.user:', req.user);

        const tasks = await Task.find({ workshopId });
        res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la récupération des tâches',
        });
    }
};

// Get tasks by workshop ID for user (checks enrollment)
exports.getTasksByWorkshopForUser = async (req, res, next) => {
    try {
        const { workshopId } = req.params;

        // Check if workshop exists
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) {
            return res.status(404).json({
                success: false,
                error: 'Workshop not found',
            });
        }


        // Check if user is enrolled in the workshop with 'inscrit' status
        const enrollment = await Enrollment.findOne({
            userId: req.user._id,
            workshopId: workshopId,
            status: 'inscrit',
        });
        if (!enrollment) {
            console.log('No enrollment found for user:', req.user._id, 'workshop:', workshopId);
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to view tasks for this workshop',
            });
        }

        const tasks = await Task.find({ workshopId });
        res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        console.error('Error fetching tasks for user:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la récupération des tâches',
        });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const task = new Task(req.body);
        await task.save();
        res.status(201).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('Error creating task:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la création de la tâche',
        });
    }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tâche non trouvée',
            });
        }
        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('Error fetching task:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la récupération de la tâche',
        });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tâche non trouvée',
            });
        }
        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la mise à jour de la tâche',
        });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tâche non trouvée',
            });
        }
        res.status(200).json({
            success: true,
            message: 'Tâche supprimée avec succès',
        });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Erreur lors de la suppression de la tâche',
        });
    }
};