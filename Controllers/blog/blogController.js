const { Blog } = require('../../Models/blogM/blog');
const Comment = require('../../Models/blogM/comment');
const mongoose = require('mongoose');

// Get all blogs
exports.getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('comments');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new blog
exports.createBlog = async (req, res) => {
    try {
        const blog = new Blog({
            title: req.body.title,
            content: req.body.content,
            image: req.file ? req.file.filename : null
        });
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update blog
exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                content: req.body.content,
                image: req.file ? req.file.filename : req.body.image
            },
            { new: true }
        );

        res.json(updatedBlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        console.log(blog)
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        await Comment.deleteMany({ postId: req.params.id });
        //await blog.remove();
        await  Blog.findByIdAndDelete(req.params.id);

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upvote blog
exports.upvoteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.upvotes = (blog.upvotes || 0) + 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Downvote blog
exports.downvoteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.downvotes = (blog.downvotes || 0) + 1;
        await blog.save();

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get blog comments
exports.getBlogComments = async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add comment to blog
exports.addComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = new Comment({
            postId: req.params.id,
            content: req.body.content,
            author: req.body.author,
            rating: req.body.rating
        });

        const savedComment = await comment.save();
        blog.comments.push(savedComment._id);
        await blog.save();

        await updateBlogRating(req.params.id);

        res.status(201).json(savedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update blog rating
async function updateBlogRating(blogId) {
    try {
        const result = await Comment.aggregate([
            { $match: { postId: mongoose.Types.ObjectId(blogId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (result.length > 0) {
            await Blog.findByIdAndUpdate(blogId, {
                averageRating: result[0].averageRating,
                ratingCount: result[0].count
            });
        }
    } catch (error) {
        console.error('Error updating blog rating:', error);
    }
}
