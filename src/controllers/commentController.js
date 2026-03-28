const Comment = require("../models/Comment");
const Post = require("../models/Post");
const asyncHandler = require("../utils/asyncHandler");

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// GET /api/posts/:postId/comments
exports.getComments = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(createError("Post not found", 404));
  }

  const comments = await Comment.find({ post: req.params.postId })
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: comments.length,
    comments,
  });
});

// POST /api/posts/:postId/comments
exports.createComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(createError("Post not found", 404));
  }

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user._id,
    post: req.params.postId,
  });

  // populate author before sending back
  await comment.populate("author", "name email");

  res.status(201).json({ success: true, comment });
});

// PUT /api/posts/:postId/comments/:commentId
exports.updateComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(createError("Comment not found", 404));
  }

  // only the comment author or admin can update
  if (
    comment.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(createError("Not authorized to update this comment", 403));
  }

  comment.content = req.body.content ?? comment.content;
  await comment.save();

  await comment.populate("author", "name email");

  res.json({ success: true, comment });
});

// DELETE /api/posts/:postId/comments/:commentId
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(createError("Comment not found", 404));
  }

  // comment author, post author, or admin can delete
  const post = await Post.findById(req.params.postId);
  const isCommentAuthor = comment.author.toString() === req.user._id.toString();
  const isPostAuthor = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
    return next(createError("Not authorized to delete this comment", 403));
  }

  await comment.deleteOne();

  res.json({ success: true, message: "Comment deleted" });
});