const express = require('express');
const {
    getBlogs,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    upvoteBlog,
    downvoteBlog,
    getBlogComments,
    addComment
} = require('../../Controllers/blog/blogController');
const multer = require('multer');
const path = require('path');
const isAll = require("../../Middlewares/User/isAll.middleware");

// Configure multer for image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Blog routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/', upload.single('image'), createBlog);
router.put('/:id', upload.single('image'), updateBlog);
router.delete('/delete/:id', deleteBlog);

// Vote routes
router.post('/:id/upvote', upvoteBlog);
router.post('/:id/downvote', downvoteBlog);

// Comment routes
router.get('/:id/comments', getBlogComments);
router.post('/:id/comments', addComment);

module.exports = router;