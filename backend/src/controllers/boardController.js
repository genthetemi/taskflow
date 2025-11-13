const Board = require('../models/boardModel');

exports.createBoard = async (req, res) => {
  try {
    const newBoard = await Board.createBoard(req.body, req.userId);
    res.status(201).json({ 
      message: 'Board created', 
      id: newBoard.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const board = await Board.getBoardById(req.params.id, req.userId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const result = await Board.updateBoard(req.params.id, req.body);
    res.status(200).json({ message: 'Board updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
