const mongoose = require("mongoose");
const Yup = require("yup");

const blogSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        title: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: true
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        ratingCount: {
            type: Number,
            default: 0
        },
        // author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


blogSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId'
});


blogSchema.index({ title: 'text', content: 'text' });

const blogValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must not exceed 100 characters"),

    content: Yup.string()
        .required("Content is required")
        .min(10, "Content must be at least 10 characters")
        .max(5000, "Content must not exceed 5000 characters"),

   // image: Yup.string()
     //   .required("Image is required")
       // .url("Invalid image URL"),
});

const validateBlog = async (blogData) => {
    try {
        await blogValidationSchema.validate(blogData, { abortEarly: false });
        return { isValid: true, errors: null };
    } catch (error) {
        return { isValid: false, errors: error.errors };
    }
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = {
    Blog,
    validateBlog,
    blogValidationSchema
};