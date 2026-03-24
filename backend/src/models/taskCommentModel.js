const mongoose = require('mongoose');

const taskCommentSchema = new mongoose.Schema(
  {
    taskId: {
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
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.TaskComment || mongoose.model('TaskComment', taskCommentSchema);