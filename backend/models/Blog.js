const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [1500, "Blog title cannot exceed 1500 characters"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [300, "Blog excerpt cannot exceed 300 characters"],
      default: "",
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    featuredImage: {
      url: {
        type: String,
        default: "",
      },
      alt: {
        type: String,
        trim: true,
        default: "",
      },
    },
    images: [
      {
        url: { type: String },
        alt: { type: String, trim: true },
      },
    ],
    author: {
      name: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
      },
      email: {
        type: String,
        required: [true, "Author email is required"],
        trim: true,
        lowercase: true,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      enum: [
        "Technology",
        "Health",
        "Lifestyle",
        "Business",
        "Education",
        "Other",
      ],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    readTime: {
      type: Number,
      default: 5,
      min: [1, "Read time must be at least 1 minute"],
    },
    views: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  next();
});

// Index for better search performance
blogSchema.index({ title: "text", content: "text", tags: "text" });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model("Blog", blogSchema);
