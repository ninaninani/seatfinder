"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    timestamps: true,
});
userSchema.index({ email: 1 }, { unique: true });
const User = mongoose_1.models.User || (0, mongoose_1.model)('User', userSchema);
exports.default = User;
