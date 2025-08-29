"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSVPStatus = void 0;
const mongoose_1 = require("mongoose");
var RSVPStatus;
(function (RSVPStatus) {
    RSVPStatus["PENDING"] = "pending";
    RSVPStatus["CONFIRMED"] = "confirmed";
    RSVPStatus["DECLINED"] = "declined";
})(RSVPStatus || (exports.RSVPStatus = RSVPStatus = {}));
const guestSchema = new mongoose_1.Schema({
    eventId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        trim: true,
    },
    seatNumber: {
        type: String,
        trim: true,
    },
    rsvpStatus: {
        type: String,
        enum: Object.values(RSVPStatus),
        default: RSVPStatus.PENDING,
        index: true,
    },
    isCheckedIn: {
        type: Boolean,
        default: false,
        index: true,
    },
    checkedInAt: {
        type: Date,
        default: null,
    },
    checkInToken: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
}, {
    timestamps: true,
});
guestSchema.index({ eventId: 1, email: 1 }, { unique: true });
guestSchema.index({ eventId: 1, isCheckedIn: 1 });
guestSchema.index({ checkInToken: 1 }, { unique: true });
guestSchema.index({ eventId: 1, createdAt: -1 });
// Additional indexes for common queries
guestSchema.index({ eventId: 1, rsvpStatus: 1 }); // For filtering by RSVP status
guestSchema.index({ eventId: 1, isCheckedIn: 1, rsvpStatus: 1 }); // For check-in stats
guestSchema.index({ eventId: 1, fullName: 1 }); // For name-based search
guestSchema.index({ eventId: 1, email: 1 }); // For email-based search (already unique)
guestSchema.index({ eventId: 1, seatNumber: 1 }); // For seat-based queries
guestSchema.index({ checkedInAt: 1 }); // For check-in time analytics
const Guest = mongoose_1.models.Guest || (0, mongoose_1.model)('Guest', guestSchema);
exports.default = Guest;
