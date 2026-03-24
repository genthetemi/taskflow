const pool = require('../config/db');
const TaskComment = require('../models/taskCommentModel');

const getAccessibleTask = async (taskId, userId) => {
  const [rows] = await pool.query(
    `SELECT t.id
     FROM tasks t
     JOIN boards b ON b.id = t.board_id
     WHERE t.id = ?
       AND (
         b.user_id = ?
         OR EXISTS (
           SELECT 1 FROM board_members bm
           WHERE bm.board_id = t.board_id AND bm.user_id = ?
         )
       )
     LIMIT 1`,
    [taskId, userId, userId]
  );

  return rows[0] || null;
};

exports.getTaskComments = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    const task = await getAccessibleTask(taskId, req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comments = await TaskComment.find({ taskId }).sort({ createdAt: 1 }).lean();
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching task comments:', error.message);
    res.status(500).json({ error: 'Failed to fetch task comments' });
  }
};

exports.addTaskComment = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const message = String(req.body.message || '').trim();

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: 'Invalid task id' });
    }

    if (!message) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const task = await getAccessibleTask(taskId, req.userId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comment = await TaskComment.create({
      taskId,
      userId: req.userId,
      authorEmail: req.userEmail || 'Unknown user',
      message
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating task comment:', error.message);
    res.status(500).json({ error: 'Failed to create task comment' });
  }
};