import mongoose, { Schema, Model } from 'mongoose';

export interface IMenuCategory {
  name: string;
  slug: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting
MenuCategorySchema.index({ order: 1 });

const MenuCategory: Model<IMenuCategory> =
  mongoose.models.MenuCategory ||
  mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);

export default MenuCategory;
