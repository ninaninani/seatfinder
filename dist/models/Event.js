"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        required: true,
        index: true,
    },
    location: {
        type: String,
        trim: true,
    },
    ownerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    maxGuests: {
        type: Number,
        default: null,
    },
    guestCount: {
        type: Number,
        default: 0,
    },
    checkedInCount: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
eventSchema.index({ ownerId: 1, createdAt: -1 });
eventSchema.index({ ownerId: 1, isActive: 1 });
eventSchema.index({ date: 1, isActive: 1 });
// Additional indexes for common queries
eventSchema.index({ ownerId: 1, date: -1 }); // For listing user's events by date
eventSchema.index({ ownerId: 1, guestCount: -1 }); // For plan limit enforcement
eventSchema.index({ isActive: 1, date: 1 }); // For active events by date
eventSchema.index({ ownerId: 1, isActive: 1, date: -1 }); // For user's active events by date
const Event = mongoose_1.models.Event || (0, mongoose_1.model)('Event', eventSchema);
exports.default = Event;
