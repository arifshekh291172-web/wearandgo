const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, default: '#000000' },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      default: 'Wear & Go',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    categorySlug: {
      type: String,
      lowercase: true,
    },
    subcategory: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'kids', 'unisex'],
      default: 'unisex',
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price must be positive'],
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discount price must be positive'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount percentage cannot be less than 0'],
      max: [100, 'Discount percentage cannot exceed 100'],
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: [val => val.length > 0, 'Please add at least one product image'],
    },
    sizes: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'],
      default: ['S', 'M', 'L', 'XL'],
    },
    colors: [colorSchema],
    SKU: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 20,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot be above 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    specifications: [
      {
        name: { type: String },
        value: { type: String },
      },
    ],
    featured: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    newArrival: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'draft'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate discount percentage automatically if discountPrice is set
productSchema.pre('save', function (next) {
  if (this.price && this.discountPrice && this.discountPrice < this.price) {
    this.discountPercentage = Math.round(
      ((this.price - this.discountPrice) / this.price) * 100
    );
  } else if (!this.discountPrice || this.discountPrice >= this.price) {
    this.discountPrice = this.price;
    this.discountPercentage = 0;
  }
  next();
});

// Indexes for fast searching and filtering
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, gender: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
