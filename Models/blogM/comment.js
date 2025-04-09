const mongoose = require('mongoose');
const yup = require('yup');

const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: [true, 'Post ID is required'],
        validate: {
            validator: function(v) {
                return mongoose.Types.ObjectId.isValid(v);
            },
            message: props => `${props.value} is not a valid post ID!`
        }
    },
    comment: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        minlength: [3, 'Comment must be at least 3 characters'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        set: v => Math.round(v) // Ensure integer values
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


CommentSchema.index({ postId: 1, rating: 1 });

// Yup validation schema with enhanced error messages
const commentValidationSchema = yup.object().shape({
    postId: yup.string()
        .required('Post ID is required')
        .test('is-valid-objectid', 'Invalid post ID format', value => {
            return mongoose.Types.ObjectId.isValid(value);
        }),
    comment: yup.string()
        .required('Please enter your comment')
        .min(3, 'Comment must be at least 3 characters')
        .max(500, 'Comment cannot exceed 500 characters'),
    rating: yup.number()
        .typeError('Rating must be a number')
        .required('Please provide a rating')
        .integer('Rating must be a whole number')
        .min(1, 'Rating must be at least 1 star')
        .max(5, 'Rating cannot exceed 5 stars')
        .transform(value => (isNaN(value) ? undefined : Math.round(value)))
});


const validateComment = async (data) => {
    try {
        // First convert rating to number if it's a string
        if (data.rating && typeof data.rating === 'string') {
            data.rating = Number(data.rating);
        }

        const validatedData = await commentValidationSchema.validate(data, {
            abortEarly: false,
            stripUnknown: true
        });

        return {
            isValid: true,
            validatedData,
            errors: null
        };
    } catch (validationError) {
        return {
            isValid: false,
            validatedData: null,
            errors: validationError.errors
        };
    }
};


CommentSchema.pre('save', function(next) {
    if (isNaN(this.rating) || this.rating < 1 || this.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    next();
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {
    Comment,
    validateComment,
    commentValidationSchema
};