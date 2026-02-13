const Board = require('../models/boardModel');
const User = require('../models/userModel');

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

exports.inviteUserToBoard = async (req, res) => {
  try {
    const boardId = Number(req.params.id);
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!boardId || !email) {
      return res.status(400).json({ error: 'Board ID and email are required' });
    }

    const canManage = await Board.isBoardOwner(boardId, req.userId);
    if (!canManage) {
      return res.status(403).json({ error: 'Only board owner can invite users' });
    }

    const invitedUser = await User.findUserByEmail(email);
    if (!invitedUser) {
      return res.status(404).json({ error: 'User not found with this email' });
    }

    if (invitedUser.id === req.userId) {
      return res.status(400).json({ error: 'You are already the board owner' });
    }

    const alreadyMember = await Board.isBoardMember(boardId, invitedUser.id);
    if (alreadyMember) {
      return res.status(400).json({ error: 'User is already a board member' });
    }

    await Board.createBoardInvitation(boardId, req.userId, invitedUser.id);

    return res.status(201).json({
      message: 'Invitation sent successfully',
      board_id: boardId,
      invited_user: {
        id: invitedUser.id,
        email: invitedUser.email
      }
    });
  } catch (error) {
    console.error('Error inviting user to board:', error);
    return res.status(500).json({ error: 'Failed to invite user to board' });
  }
};

exports.getMyInvitations = async (req, res) => {
  try {
    const invitations = await Board.getPendingInvitationsForUser(req.userId);
    return res.status(200).json(invitations);
  } catch (error) {
    console.error('Error loading invitations:', error);
    return res.status(500).json({ error: 'Failed to load invitations' });
  }
};

exports.respondToInvitation = async (req, res) => {
  try {
    const invitationId = Number(req.params.invitationId);
    const action = String(req.body?.action || '').trim().toLowerCase();

    if (!invitationId || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Valid invitation id and action are required' });
    }

    const invitation = await Board.getInvitationForUser(invitationId, req.userId);
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: `Invitation already ${invitation.status}` });
    }

    if (action === 'accept') {
      await Board.addBoardMember(invitation.board_id, req.userId, invitation.inviter_user_id, 'member');
      await Board.respondToInvitation(invitationId, 'accepted');
      return res.status(200).json({ message: 'Invitation accepted', board_id: invitation.board_id });
    }

    await Board.respondToInvitation(invitationId, 'rejected');
    return res.status(200).json({ message: 'Invitation rejected', board_id: invitation.board_id });
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return res.status(500).json({ error: 'Failed to respond to invitation' });
  }
};
