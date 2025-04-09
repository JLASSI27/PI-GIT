const { validateBlog, Blog } = require("../../Models/blogM/blog");


exports.getAllBlogs = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;


        const sortField = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;


        const query = {};
        if (req.query.title) {
            query.title = { $regex: req.query.title, $options: 'i' };
        }
        if (req.query.content) {
            query.content = { $regex: req.query.content, $options: 'i' };
        }

        const blogs = await Blog.find(query)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.json({
            data: blogs,
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


exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getBlogsByTitle = async (req, res) => {
    try {
        const blogs = await Blog.find({ title: req.params.title });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.searchBlogs = async (req, res) => {
    try {
        const keyword = req.query.q;
        if (!keyword) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const blogs = await Blog.find({
            $or: [
                { title: { $regex: keyword, $options: 'i' } },
                { content: { $regex: keyword, $options: 'i' } }
            ]
        });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.createBlog = async (req, res) => {
    const { title, content } = req.body;
    let image = `${req.protocol}://${req.get('host')}/img/${req.file.filename}`;

    try {
        const validation = await validateBlog({ title, content, image });

        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const existingBlog = await Blog.findOne({ title: title });
        if (existingBlog) {
            return res.status(400).json({ message: 'Blog title already exists' });
        }

        const blog = new Blog({ title, content, image });
        await blog.save();

        return res.status(201).json({
            message: "Blog created successfully!",
            data: blog
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};


exports.updateBlog = async (req, res) => {
    const { id } = req.params;
    let updateData = { ...req.body };


    if (req.file) {
        updateData.image = `${req.protocol}://${req.get('host')}/img/${req.file.filename}`;
    }

    try {

        const validation = await validateBlog(updateData);
        if (!validation.isValid) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json({
            message: 'Blog updated successfully',
            data: updatedBlog
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.deleteBlog = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }


        await Comment.deleteMany({ postId: id });

        res.json({
            message: 'Blog deleted successfully',
            data: deletedBlog
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};