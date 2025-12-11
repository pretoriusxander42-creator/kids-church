import mongoose, { Schema, Model, Types } from 'mongoose';

export interface IMenuItem {
  title: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  imageUrl?: string;
  tags?: string[];
  available: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    title: {
      type: String,
      required: [true, 'Menu item title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Menu item description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'MenuCategory',
      required: [true, 'Category is required'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for category-based queries
MenuItemSchema.index({ category: 1, available: 1 });

const MenuItem: Model<IMenuItem> =
  mongoose.models.MenuItem ||
  mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);

export default MenuItem;
