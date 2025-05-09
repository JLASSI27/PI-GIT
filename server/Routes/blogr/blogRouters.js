const express = require('express');
const {
    getAllBlogs,
    getBlogById,
    getBlogsByTitle,
    searchBlogs,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../../Controllers/blog/blogController');
const multer = require('../../Middlewares/multer-config');
const isAll = require("../../Middlewares/User/isAll.middleware");
const router = express.Router();


router.get('/', getAllBlogs);
router.get('/search', searchBlogs);
router.get('/:id', getBlogById);
router.get('/title/:title', getBlogsByTitle);


router.post('/add', multer.single("image"),isAll, createBlog);
router.put('/update/:id', multer.single("image"),isAll, updateBlog);
router.delete('/delete/:id',isAll, deleteBlog);

module.exports = router;