const Task = require('../../Models/workshop/Task');
const Workshop = require('../../Models/workshop/Workshop');

exports.createTask = async (req, res) => {
    try {
        const { workshopId, title, description, order, type, content } = req.body;
        
        const task = new Task({
            workshopId,
            title,
            description,
            order,
            type,
            content
        });
        
        const savedTask = await task.save();
        
        // Ajouter la tâche au workshop
        await Workshop.findByIdAndUpdate(
            workshopId,
            { $push: { tasks: savedTask._id } }
        );

        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const { workshopId } = req.params;
        const tasks = await Task.find({ workshopId }).sort('order');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};