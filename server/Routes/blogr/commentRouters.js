const express = require('express');
const {
    getComments,
    getCommentById,
    getCommentsByRating,
    addComment,
    updateComment,
    deleteComment
} = require('../../Controllers/blog/commentController');
const isAll = require("../../Middlewares/User/isAll.middleware");
const router = express.Router();


router.get('/:blogId', getComments);
router.get('/:blogId/rating/:rating', getCommentsByRating);
router.get('/comment/:id', getCommentById);


router.post('/:postId',isAll, addComment);
router.put('/update/:id',isAll, updateComment);
router.delete('/delete/:id',isAll, deleteComment);

module.exports = router;