import { Schema, model, models, Document, Types } from 'mongoose';

export enum RSVPStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DECLINED = 'declined',
}

export interface IGuest extends Document {
  eventId: Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  seatNumber?: string;
  rsvpStatus: RSVPStatus;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  checkInToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const guestSchema = new Schema<IGuest>({
  eventId: {
    type: Schema.Types.ObjectId,
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

const Guest = models.Guest || model<IGuest>('Guest', guestSchema);

export default Guest;