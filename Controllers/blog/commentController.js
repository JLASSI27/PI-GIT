const { Comment, validateComment } = require('../../Models/blogM/comment');
const { Blog } = require('../../Models/blogM/blog');
const mongoose = require('mongoose');

exports.getComments = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const comments = await Comment.find({ postId: req.params.blogId })
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await Comment.countDocuments({ postId: req.params.blogId });

        res.json({
            data: comments,
            meta: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCommentsByRating = async (req, res) => {
    try {
        const rating = parseInt(req.params.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const comments = await Comment.find({
            postId: req.params.blogId,
            rating: rating
        });

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { comment = '', rating = null } = req.body;
        const { postId } = req.params;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'You must be logged in to comment.' });
        }

        const blog = await Blog.findById(postId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const numericRating = rating !== null ? Number(rating) : null;

        const validation = await validateComment({
            postId,
            comment,
            rating: numericRating
        });

        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const newComment = new Comment({
            postId,
            comment,
            rating: numericRating,
            user: req.user._id
        });

        await newComment.save();

        await exports.updateBlogRating(postId);

        return res.status(201).json({
            message: "Comment added successfully!",
            data: newComment
        });
    } catch (error) {
        console.error('Detailed error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.updateComment = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    try {
        const existingComment = await Comment.findById(id);
        if (!existingComment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (
            !existingComment.user.equals(req.user._id) &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Unauthorized to update this comment' });
        }

        const validation = await validateComment({
            postId: existingComment.postId,
            rating,
            comment,
            user: existingComment.user
        });

        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            id,
            { rating, comment },
            { new: true, runValidators: true }
        );

        await exports.updateBlogRating(existingComment.postId);

        res.json({
            message: 'Comment updated successfully',
            data: updatedComment
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (
            !comment.user.equals(req.user._id) &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        const deletedComment = await Comment.findByIdAndDelete(id);

        await exports.updateBlogRating(comment.postId);

        res.json({
            message: 'Comment deleted successfully',
            data: deletedComment
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBlogRating = async (postId) => {
    try {
        const result = await Comment.aggregate([
            { $match: { postId: mongoose.Types.ObjectId(postId) } },
            { $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }}
        ]);

        if (result.length > 0) {
            await Blog.findByIdAndUpdate(postId, {
                averageRating: result[0].averageRating,
                ratingCount: result[0].count
            });
        }
    } catch (error) {
        console.error('Error updating blog rating:', error);
    }
};

exports.getByUser = async (req, res) => {
    try {
        const { id } = req.params;
        const comments = await Comment.find({ user: id });
        res.status(200).json(comments);
    } catch (e) {
        res.status(500).json({ message: "server error" });
        console.log(e);
    }
};

exports.getCommentStats = async (req, res) => {
    try {
        const totalComments = await Comment.countDocuments();
        const commentsByRating = await Comment.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            total: totalComments,
            byRating: commentsByRating
        });
    } catch (error) {
        console.error("Error fetching comment stats:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};