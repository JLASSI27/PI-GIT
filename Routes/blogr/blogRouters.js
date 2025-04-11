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
const router = express.Router();


router.get('/', getAllBlogs);
router.get('/search', searchBlogs);
router.get('/:id', getBlogById);
router.get('/title/:title', getBlogsByTitle);


router.post('/add', multer.single("image"), createBlog);
router.put('/update/:id', multer.single("image"), updateBlog);
router.delete('/delete/:id', deleteBlog);

module.exports = router;