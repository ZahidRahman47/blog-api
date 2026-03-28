const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

// auto-generate slug from title before saving
postSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  // make slug unique by appending post id if needed
  const existing = await mongoose.model("Post").findOne({
    slug: this.slug,
    _id: { $ne: this._id },
  });

  if (existing) {
    this.slug = `${this.slug}-${this._id}`;
  }
});

module.exports = mongoose.model("Post", postSchema);