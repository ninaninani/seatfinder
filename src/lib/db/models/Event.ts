import { Schema, model, models, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  ownerId: Types.ObjectId;
  maxGuests?: number;
  guestCount: number;
  checkedInCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
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
    type: Schema.Types.ObjectId,
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

const Event = models.Event || model<IEvent>('Event', eventSchema);

export default Event;