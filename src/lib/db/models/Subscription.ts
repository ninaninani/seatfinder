import { Schema, model, models, Document, Types } from 'mongoose';

export enum PlanType {
  PLAN_I = 'plan_i',
  PLAN_II = 'plan_ii',
  PLAN_III = 'plan_iii',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  planType: PlanType;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  transactionId?: string;
  invoiceReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: Object.values(PlanType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.INACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    invoiceReference: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

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

const Subscription =
  models.Subscription ||
  model<ISubscription>('Subscription', subscriptionSchema);

export default Subscription;
