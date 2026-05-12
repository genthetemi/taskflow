const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    boardId: {
      type: Number,
      required: true,
      index: true
    },
    userId: {
      type: Number,
      required: true
    },
    authorEmail: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);