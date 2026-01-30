import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema({

    type: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    extractedData: {
        type: Object,
        default: {}
    },
    verifiedStatus: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED"],
        default: "PENDING"
    }
}, { _id: false });


const admissionApplicationSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Branch",
        required: true
    },
    // ================= STUDENT BASIC DETAILS =================
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    // ================= ADDRESS =================
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    // ================= ACADEMIC DETAILS =================
    tenthMarks: {
        type: Number,
        required: true
    },
    tenthBoard: {
        type: String,
        required: true
    },
    tenthPassingYear: {
        type: Number,
        required: true
    },
    twelfthMarks: {
        type: Number,
        required: true
    },
    twelfthBoard: {
        type: String,
        required: true
    },
    twelfthPassingYear: {
        type: Number,
        required: true
    },
    entranceExamName: {
        type: String
    },
    entranceScore: {
        type: Number
    },
    entranceRank: {
        type: Number
    },
    // ================= DOCUMENTS =================
    documents: {
        type: [documentSchema],
        default: []
    },
    // ================= AI RESULT =================
    eligibilityCheckResult: {
        eligible: {
            type: Boolean
        },

        reason: {
            type: String
        }
    },
    // ================= SYSTEM + AI LOGS =================
    reviewLogs: {
        type: [
            {
                message: {
                    type: String
                },

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        default: []
    },
    // ================= APPLICATION STATUS =================
    formStatus: {
        type: String,
        enum: [
            "DRAFT",
            "SUBMITTED",
            "UNDER_AI_REVIEW",
            "AI_APPROVED",
            "AI_REJECTED",
            "MANUAL_REVIEW",
            "FINAL_APPROVED",
            "FINAL_REJECTED"
        ],
        default: "SUBMITTED"
    }
}, { timestamps: true });

admissionApplicationSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

admissionApplicationSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

admissionApplicationSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );
};

admissionApplicationSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

admissionApplicationSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    return resetToken;
};

admissionApplicationSchema.methods.getVerificationToken = function () {
    const verificationToken = crypto.randomBytes(20).toString("hex");
    this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    this.emailVerificationTokenExpires = Date.now() + 15 * 60 * 1000;
    return verificationToken;
};

export const AdmissionApplication = mongoose.model("AdmissionApplication", admissionApplicationSchema);
