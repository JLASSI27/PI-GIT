const Progress = require('../../Models/workshop/UserProgress');

// Save or update progress
exports.saveProgress = async (req, res) => {
    try {
        const { workshopId, lastTaskIndex } = req.body;
        if (!workshopId || lastTaskIndex === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Workshop ID and last task index are required',
            });
        }

        const progress = await Progress.findOneAndUpdate(
            { user: req.user.userId, workshop: workshopId },
            { lastTaskIndex },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error saving progress',
        });
    }
};

// Get user progress
exports.getMyProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user.userId }).populate('workshop');
        res.status(200).json({
            success: true,
            data: progress,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Error fetching progress',
        });
    }
};