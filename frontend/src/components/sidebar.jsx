import { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiFolder, FiCheckSquare } from 'react-icons/fi';

const Sidebar = ({ boards, activeBoard, onBoardSelect, onCreateBoard, onEditBoard, onDeleteBoard, isOpen = true, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoard, setNewBoard] = useState({
    name: '',
    description: ''
  });

  // Do not render sidebar on small screens when closed
  const mobileHidden = typeof isOpen === 'boolean' && !isOpen;

  const handleCreateClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setNewBoard({ name: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBoard.name.trim()) return;

    setIsCreating(true);
    try {
      await onCreateBoard({
        name: newBoard.name.trim(),
        description: newBoard.description.trim()
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={() => onClose && onClose()}></div>
      <aside className={`sidebar-wrapper ${mobileHidden ? 'collapsed' : ''}`} aria-hidden={mobileHidden}>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="logo">TaskFlow</h2>
            <p className="text-muted">Workspace</p>
          </div>
          <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={() => onClose && onClose()} aria-label="Close sidebar">✕</button>
        </div>

      <div className="boards-list">
        {boards.map(board => (
          <div
            key={board.id}
            className={`board-item ${activeBoard?.id === board.id ? 'active' : ''}`}
            onClick={() => {
              onBoardSelect(board);
              if (onClose) {
                onClose();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <span className="board-name">
              <FiFolder />
              {board.name}
            </span>
            <div className="board-info">
              <span className="task-count">
                <FiCheckSquare /> {board.task_count || 0}
              </span>
              <div className="board-actions">
                <button
                  className="btn btn-sm btn-outline-warning board-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBoard(board);
                  }}
                  title="Edit board"
                >
                  <FiEdit2 />
                </button>
                <button
                  className="btn btn-sm btn-outline-danger board-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBoard(board.id);
                  }}
                  title="Delete board"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="primary" 
        className="w-100 mt-3"
        onClick={handleCreateClick}
      >
        + New Board
      </Button>

      {/* Create Board Modal */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Board</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Board Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter board name"
                value={newBoard.name}
                onChange={(e) => setNewBoard({...newBoard, name: e.target.value})}
                disabled={isCreating}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter board description"
                value={newBoard.description}
                onChange={(e) => setNewBoard({...newBoard, description: e.target.value})}
                disabled={isCreating}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                onClick={handleClose} 
                className="me-2"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={!newBoard.name.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Board'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </aside>
    </>
  );
};

export default Sidebar;