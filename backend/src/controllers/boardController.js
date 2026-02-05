const Board = require('../models/boardModel');

exports.createBoard = async (req, res) => {
  try {
    // Log request for debugging purposes
    console.log('createBoard called with body:', req.body, 'userId:', req.userId);

    // Ensure user is authenticated
    if (!req.userId) {
      console.warn('createBoard: missing userId (likely invalid/missing token)');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const { name, description } = req.body || {};
    if (!name || !name.trim()) {
      console.warn('createBoard: invalid input, missing name:', req.body);
      return res.status(400).json({ error: 'Board name is required' });
    }

    const result = await Board.createBoard({ name: name.trim(), description: description || '' }, req.userId);

    // Return the newly created board object so frontend can use it directly
    const createdBoard = await Board.getBoardById(result.insertId, req.userId);

    res.status(201).json(createdBoard);
  } catch (error) {
    // Log full error for debugging
    console.error('Error creating board:', error);
    // Return a useful error message and include a short detail for debugging
    const details = error.code || error.sqlMessage || error.message;
    res.status(500).json({ error: 'Error creating board', details });
  }
};

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.getAllBoards(req.userId);
    res.status(200).json(boards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.getBoardById(req.params.id, req.userId);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.status(200).json(board);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoard = async (req, res) => {
  try {
    console.log('updateBoard called with params:', req.params, 'body:', req.body, 'userId:', req.userId);

    // Ensure authenticated
    if (!req.userId) {
      console.warn('updateBoard: missing userId');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    const { name, description } = req.body || {};
    if (!name || (typeof name === 'string' && !name.trim())) {
      console.warn('updateBoard: invalid name', req.body);
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board = await Board.getBoardById(req.params.id, req.userId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    await Board.updateBoard(req.params.id, { name: typeof name === 'string' ? name.trim() : name, description: description || '' });

    const updatedBoard = await Board.getBoardById(req.params.id, req.userId);
    res.status(200).json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);
    const details = error.code || error.sqlMessage || error.message;
    res.status(500).json({ error: 'Error updating board', details });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.getBoardById(req.params.id, req.userId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    await Board.deleteBoard(req.params.id);
    res.status(200).json({ message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
