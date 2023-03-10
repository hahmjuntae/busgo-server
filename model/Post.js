const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
  {
    postId: {
      type: Number,
      unique: true,
      required: true,
    },
  },
  { autoIndex: false, timestamps: false },
);

const Post = mongoose.model('Post', postSchema);

module.exports = { Post };
