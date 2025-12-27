import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: 'user.png',
        },
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        role: {
            type: String,
            enum: ['Student', 'Faculty', 'Admin', 'Guard', 'Hostel_Staff', 'Club_Coordinator'],
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        accessToken: {
            type: String
        },
        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        emailVerificationToken: {
            type: String,
            default: null
        },
        emailVerificationTokenExpires: {
            type: Date,
            default: null
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "100h" }
    );
};

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

userSchema.methods.getVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString("hex");
    this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    this.emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;
    return verificationToken;
};

export const User = mongoose.model("User", userSchema);