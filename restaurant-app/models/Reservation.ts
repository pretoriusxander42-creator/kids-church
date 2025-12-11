import mongoose, { Schema, Model } from 'mongoose';

export interface IReservation {
  fullName: string;
  email: string;
  phone: string;
  date: Date;
  guests: number;
  occasion?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'declined';
  createdAt?: Date;
  updatedAt?: Date;
}

const ReservationSchema = new Schema<IReservation>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
      max: [20, 'Maximum 20 guests allowed'],
    },
    occasion: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'declined'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReservationSchema.index({ date: 1, status: 1 });

const Reservation: Model<IReservation> =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>('Reservation', ReservationSchema);

export default Reservation;
