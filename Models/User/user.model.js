const mongoose = require("mongoose");
const Yup = require("yup");

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        number: { type: String, required: true },
        role: { type: String, default: "user" },
        isVerified: { type: Boolean, default: false },
        verificationCode: { type: String, default: null },
        codeExpiration: { type: Date, default: null }
    },
    { timestamps: true }
);

const userValidationSchema = Yup.object().shape({
    firstName: Yup.string()
        .required("First name is required")
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must not exceed 50 characters"),

    lastName: Yup.string()
        .required("Last name is required")
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must not exceed 50 characters"),

    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format")
        .max(255, "Email must not exceed 255 characters"),

    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(
            /^(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter and one number"
        ),

    number: Yup.string()
        .required("Phone number is required")
        .matches(
            /^[0-9]+$/,
            "Phone number must contain only digits"
        )
        .min(8, "Phone number must be at least 8 digits")
        .max(8, "Phone number must not exceed 8 digits"),

    role: Yup.string()
        .default("user")
        .oneOf(["user", "admin", "organisateur"], "Invalid role"),

    isVerified: Yup.boolean()
        .default(false)
});

const validateUser = async (userData) => {
    try {
        await userValidationSchema.validate(userData, { abortEarly: false });
        return { isValid: true, errors: null };
    } catch (error) {
        return { isValid: false, errors: error.errors };
    }
};

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    validateUser,
    userValidationSchema
};