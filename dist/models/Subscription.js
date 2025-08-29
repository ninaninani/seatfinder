"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.PlanType = void 0;
const mongoose_1 = require("mongoose");
var PlanType;
(function (PlanType) {
    PlanType["PLAN_I"] = "plan_i";
    PlanType["PLAN_II"] = "plan_ii";
    PlanType["PLAN_III"] = "plan_iii";
})(PlanType || (exports.PlanType = PlanType = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["INACTIVE"] = "inactive";
    SubscriptionStatus["PENDING"] = "pending";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["EXPIRED"] = "expired";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
const subscriptionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    planType: {
        type: String,
        enum: Object.values(PlanType),
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.INACTIVE,
        index: true,
    },
    startDate: {
        type: Date,
        required: true,
        index: true,
    },
    endDate: {
        type: Date,
        index: true,
    },
    transactionId: {
        type: String,
        sparse: true,
    },
    invoiceReference: {
        type: String,
        sparse: true,
    },
}, {
    timestamps: true,
});
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, createdAt: -1 });
subscriptionSchema.index({ transactionId: 1 }, { sparse: true });
subscriptionSchema.index({ endDate: 1, status: 1 });
// Additional indexes for common queries
subscriptionSchema.index({ userId: 1, status: 1, planType: 1 }); // For user's active plan
subscriptionSchema.index({ status: 1, planType: 1 }); // For plan analytics
subscriptionSchema.index({ userId: 1, status: 1, endDate: 1 }); // For subscription expiry checks
subscriptionSchema.index({ startDate: 1, status: 1 }); // For subscription start analytics
subscriptionSchema.index({ invoiceReference: 1 }, { sparse: true }); // For invoice lookups
const Subscription = mongoose_1.models.Subscription ||
    (0, mongoose_1.model)('Subscription', subscriptionSchema);
exports.default = Subscription;
