const express = require('express');
const {
    getComments,
    getCommentById,
    getCommentsByRating,
    addComment,
    updateComment,
    deleteComment
} = require('../controllers/blog/commentController');
const router = express.Router();


router.get('/:blogId', getComments);
router.get('/:blogId/rating/:rating', getCommentsByRating);
router.get('/comment/:id', getCommentById);


router.post('/:postId', addComment);
router.put('/update/:id', updateComment);
router.delete('/delete/:id', deleteComment);

module.exports = router;