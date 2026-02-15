const Task = require('../models/taskModel');
const pool = require('../config/db'); // Add this import

const hasBoardAccess = async (boardId, userId) => {
  const [board] = await pool.query(
    `SELECT id
     FROM boards
     WHERE id = ?
       AND (
         user_id = ?
         OR EXISTS (
           SELECT 1 FROM board_members
           WHERE board_id = boards.id AND user_id = ?
         )
       )
     LIMIT 1`,
    [boardId, userId, userId]
  );

  return board.length > 0;
};

const isBoardOwner = async (boardId, userId) => {
  const [rows] = await pool.query(
    'SELECT id FROM boards WHERE id = ? AND user_id = ? LIMIT 1',
    [boardId, userId]
  );
  return rows.length > 0;
};

const isUserInBoard = async (boardId, userId) => {
  const [rows] = await pool.query(
    `SELECT b.id
     FROM boards b
     WHERE b.id = ?
       AND (
         b.user_id = ?
         OR EXISTS (
           SELECT 1 FROM board_members bm
           WHERE bm.board_id = b.id AND bm.user_id = ?
         )
       )
     LIMIT 1`,
    [boardId, userId, userId]
  );
  return rows.length > 0;
};

const parseAssignee = (value) => {
  if (value === undefined) {
    return { provided: false, value: undefined };
  }

  if (value === null || value === '') {
    return { provided: true, value: null };
  }

  const assigneeId = Number(value);
  if (!Number.isInteger(assigneeId) || assigneeId <= 0) {
    throw new Error('Invalid assignee_user_id');
  }

  return { provided: true, value: assigneeId };
};

exports.getTasks = async (req, res) => {
  try {
    const boardId = req.query.board_id;
    
    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' });
    }

    const canAccessBoard = await hasBoardAccess(boardId, req.userId);
    if (!canAccessBoard) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const tasks = await Task.getAllTasks(boardId);
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.addTask = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title || !req.body.board_id) {
      return res.status(400).json({ 
        error: 'Title and Board ID are required' 
      });
    }

    const canAccessBoard = await hasBoardAccess(req.body.board_id, req.userId);

    if (!canAccessBoard) {
      return res.status(404).json({ 
        error: 'Board not found or unauthorized' 
      });
    }

    const boardOwner = await isBoardOwner(req.body.board_id, req.userId);

    let assignee;
    try {
      assignee = parseAssignee(req.body.assignee_user_id);
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }

    if (assignee.provided) {
      if (assignee.value === null) {
        req.body.assignee_user_id = null;
      } else {
        const assigneeInBoard = await isUserInBoard(req.body.board_id, assignee.value);
        if (!assigneeInBoard) {
          return res.status(400).json({ error: 'Assignee must be a user on this board' });
        }

        if (!boardOwner && assignee.value !== req.userId) {
          return res.status(403).json({ error: 'Board members can only assign tasks to themselves' });
        }

        req.body.assignee_user_id = assignee.value;
      }
    } else {
      req.body.assignee_user_id = null;
    }

    // Validate and normalize status if provided
    if (req.body.status) {
      const raw = String(req.body.status).toLowerCase().trim().replace(/\s+/g, '-');
      console.log('Status mapping - raw input:', raw);
      const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'inprogress': 'In Progress',
        'completed': 'Completed',
        'complete': 'Completed'
      };
      req.body.status = statusMap[raw];
      console.log('Status mapping - result:', req.body.status);
      if (!req.body.status) {
        return res.status(400).json({ error: 'Invalid status value. Use: pending, in-progress, or completed' });
      }
    }

    // Validate and normalize priority if provided
    if (req.body.priority) {
      const raw = String(req.body.priority).toLowerCase().trim();
      console.log('Priority mapping - raw input:', raw);
      const priorityMap = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High'
      };
      req.body.priority = priorityMap[raw];
      console.log('Priority mapping - result:', req.body.priority);
      if (!req.body.priority) {
        return res.status(400).json({ error: 'Invalid priority value. Use: low, medium, or high' });
      }
    }

    const newTask = await Task.createTask(req.body, req.userId);
    res.status(201).json({ 
      message: 'Task created', 
      id: newTask.insertId,
      board_id: req.body.board_id 
    });
  } catch (error) {
    console.error("Error creating task:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const [existingTask] = await pool.query(
      `SELECT t.user_id,
              t.assignee_user_id,
              t.board_id,
              b.user_id AS board_owner_id,
              EXISTS (
                SELECT 1 FROM board_members bm
                WHERE bm.board_id = t.board_id AND bm.user_id = ?
              ) AS is_board_member
       FROM tasks t
       JOIN boards b ON b.id = t.board_id
       WHERE t.id = ?`,
      [req.userId, req.params.id]
    );
    
    if (!existingTask.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isTaskOwner = existingTask[0].user_id === req.userId;
    const isBoardOwner = existingTask[0].board_owner_id === req.userId;
    const isBoardMember = Number(existingTask[0].is_board_member) === 1;
    const currentAssignee = existingTask[0].assignee_user_id === null
      ? null
      : Number(existingTask[0].assignee_user_id);

    if (!isTaskOwner && !isBoardOwner && !isBoardMember) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const targetBoardId = req.body.board_id ? Number(req.body.board_id) : Number(existingTask[0].board_id);

    if (req.body.board_id) {
      const canAccessTargetBoard = await hasBoardAccess(req.body.board_id, req.userId);
      if (!canAccessTargetBoard) {
        return res.status(403).json({ error: 'Cannot move task to unauthorized board' });
      }
    }

    let assignee;
    try {
      assignee = parseAssignee(req.body.assignee_user_id);
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }

    const isAssigneeChanging = assignee.provided && assignee.value !== currentAssignee;

    if (isAssigneeChanging) {
      if (!isBoardOwner) {
        if (assignee.value === null) {
          return res.status(403).json({ error: 'Only board owner can unassign tasks' });
        }

        if (currentAssignee !== null) {
          return res.status(409).json({ error: 'Task is already assigned' });
        }

        if (assignee.value !== req.userId) {
          return res.status(403).json({ error: 'Board members can only assign unassigned tasks to themselves' });
        }
      }

      if (assignee.value !== null) {
        const assigneeInBoard = await isUserInBoard(targetBoardId, assignee.value);
        if (!assigneeInBoard) {
          return res.status(400).json({ error: 'Assignee must be a user on the target board' });
        }
      }

      req.body.assignee_user_id = assignee.value;
    } else if (assignee.provided) {
      req.body.assignee_user_id = assignee.value;
    }

    if (req.body.board_id && !assignee.provided && currentAssignee !== null) {
      const assigneeStillInBoard = await isUserInBoard(targetBoardId, currentAssignee);
      if (!assigneeStillInBoard) {
        return res.status(400).json({ error: 'Current assignee is not part of target board' });
      }
    }

    // Validate and normalize status if provided
    if (req.body.status) {
      const raw = String(req.body.status).toLowerCase().trim().replace(/\s+/g, '-');
      console.log('Status mapping - raw input:', raw);
      const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'inprogress': 'In Progress',
        'completed': 'Completed',
        'complete': 'Completed'
      };
      req.body.status = statusMap[raw];
      console.log('Status mapping - result:', req.body.status);
      if (!req.body.status) {
        return res.status(400).json({ error: 'Invalid status value. Use: pending, in-progress, or completed' });
      }
    }

    // Validate and normalize priority if provided
    if (req.body.priority) {
      const raw = String(req.body.priority).toLowerCase().trim();
      console.log('Priority mapping - raw input:', raw);
      const priorityMap = {
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High'
      };
      req.body.priority = priorityMap[raw];
      console.log('Priority mapping - result:', req.body.priority);
      if (!req.body.priority) {
        return res.status(400).json({ error: 'Invalid priority value. Use: low, medium, or high' });
      }
    }

    await Task.updateTask(req.params.id, req.body);
    res.status(200).json({ message: 'Task updated' });
  } catch (error) {
    console.error("Error updating task:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const [existingTask] = await pool.query(
      `SELECT t.user_id,
              t.board_id,
              b.user_id AS board_owner_id,
              EXISTS (
                SELECT 1 FROM board_members bm
                WHERE bm.board_id = t.board_id AND bm.user_id = ?
              ) AS is_board_member
       FROM tasks t
       JOIN boards b ON b.id = t.board_id
       WHERE t.id = ?`,
      [req.userId, req.params.id]
    );
    
    if (!existingTask.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isTaskOwner = existingTask[0].user_id === req.userId;
    const isBoardOwner = existingTask[0].board_owner_id === req.userId;
    const isBoardMember = Number(existingTask[0].is_board_member) === 1;

    if (!isTaskOwner && !isBoardOwner && !isBoardMember) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Task.deleteTask(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error("Error deleting task:", error.message);
    res.status(500).json({ error: error.message });
  }
};