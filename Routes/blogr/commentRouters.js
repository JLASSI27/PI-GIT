const express = require('express');
const {
    getComments,
    getCommentById,
    getCommentsByRating,
    addComment,
    updateComment,
    deleteComment,
    getByUser,
    getCommentStats
} = require('../../Controllers/blog/commentController');
const isAll = require("../../Middlewares/User/isAll.middleware");
const router = express.Router();

router.get('/:blogId', getComments);
router.get('/:blogId/rating/:rating', getCommentsByRating);
router.get('/comment/:id', getCommentById);
router.get('/comment/user/:id', getByUser);
router.get('/stats/all', getCommentStats);

router.post('/:postId', isAll, addComment);
router.put('/update/:id', isAll, updateComment);
router.delete('/delete/:id', isAll, deleteComment);

module.exports = router;