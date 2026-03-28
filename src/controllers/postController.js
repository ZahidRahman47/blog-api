const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// GET /api/posts
exports.getAllPosts = asyncHandler(async (req, res) => {
  const { status, tag, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (tag) filter.tags = tag;

  const skip = (page - 1) * limit;

  const posts = await Post.find(filter)
    .populate("author", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Post.countDocuments(filter);

  res.json({
    success: true,
    count: posts.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    posts,
  });
});

// GET /api/posts/:id
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate(
    "author",
    "name email"
  );

  if (!post) {
    return next(createError("Post not found", 404));
  }

  res.json({ success: true, post });
});

// POST /api/posts
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, tags, status } = req.body;

  const post = await Post.create({
    title,
    content,
    tags,
    status,
    author: req.user._id, // comes from protect middleware
  });

  res.status(201).json({ success: true, post });
});

// PUT /api/posts/:id
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(createError("Post not found", 404));
  }

  // check ownership — only author or admin can update
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(createError("Not authorized to update this post", 403));
  }

  const { title, content, tags, status } = req.body;

  post.title = title ?? post.title;
  post.content = content ?? post.content;
  post.tags = tags ?? post.tags;
  post.status = status ?? post.status;

  await post.save();

  res.json({ success: true, post });
});

// DELETE /api/posts/:id
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(createError("Post not found", 404));
  }

  // check ownership
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return next(createError("Not authorized to delete this post", 403));
  }

  await post.deleteOne();

  res.json({ success: true, message: "Post deleted" });
});