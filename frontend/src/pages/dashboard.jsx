import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Modal, Form, Button } from 'react-bootstrap';
import Navbar from '../components/navbar';
import TaskList from '../components/taskList';
import Sidebar from '../components/sidebar';
import StatsCard from '../components/statsCard';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/tasks';
import { fetchBoards, createBoard, updateBoard, deleteBoard } from '../services/boards';
import '../styles/dashboard.css';

const Dashboard = () => {
  // State declarations
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  // Toggle task status helper: pending -> in-progress -> completed -> pending
  const handleToggleStatus = async (task) => {
    try {
      const order = ['pending', 'in-progress', 'completed'];
      const idx = order.indexOf((task.status || 'pending').toLowerCase());
      const next = order[(idx + 1) % order.length];
      await updateTask(task.id, { ...task, status: next, board_id: activeBoard?.id });
      const updatedTasks = await fetchTasks(activeBoard.id);
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  // Load boards on mount
  useEffect(() => {
    const loadBoards = async () => {
      try {
        const boardsData = await fetchBoards();
        setBoards(boardsData);
      } catch (err) {
        setError('Failed to load boards');
      }
    };
    loadBoards();
  }, []);

  // Load tasks when board changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (!activeBoard?.id) {
          setTasks([]);
          return;
        }
        const taskData = await fetchTasks(activeBoard.id);
        setTasks(taskData);
      } catch (error) {
        setError('Failed to load tasks');
        setTasks([]);
      }
    };
    loadTasks();
  }, [activeBoard]);

  // Board handlers
  const handleCreateBoard = async (boardInput) => {
    try {
      // Support both string and object input from Sidebar
      let payload;
      if (typeof boardInput === 'string') {
        payload = {
          name: boardInput,
          description: `Board for ${boardInput} tasks`
        };
      } else {
        const name = boardInput?.name?.trim();
        const description = boardInput?.description?.trim() || `Board for ${name} tasks`;
        if (!name) {
          setError('Board name is required');
          return;
        }
        payload = { name, description };
      }

      const newBoard = await createBoard(payload);
      const updatedBoards = await fetchBoards();
      setBoards(updatedBoards);
      setActiveBoard(newBoard);
    } catch (err) {
      setError(err.message || 'Failed to create board');
    }
  };

  const handleUpdateBoard = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateBoard(editingBoard.id, editingBoard);
      const updatedBoards = await fetchBoards();
      setBoards(updatedBoards);
      // Use the server's returned board to avoid stale/partial state
      setActiveBoard(updated || updatedBoards.find(b => b.id === editingBoard.id));
      setShowEditBoardModal(false);
      setEditingBoard(null);
    } catch (err) {
      // Show server-provided message when available
      setError(err.message || 'Failed to update board');
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (window.confirm('Are you sure you want to delete this board and all its tasks?')) {
      try {
        await deleteBoard(boardId);
        const updatedBoards = await fetchBoards();
        setBoards(updatedBoards);
        if (activeBoard?.id === boardId) {
          setActiveBoard(null);
          setTasks([]);
        }
      } catch (err) {
        setError('Failed to delete board');
      }
    }
  };

  // Task handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTask,
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id);
      setTasks(updatedTasks);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      });
      setShowTaskModal(false);
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateTask(editingTask.id, {
        ...editingTask,
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id);
      setTasks(updatedTasks);
      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        const updatedTasks = await fetchTasks(activeBoard.id);
        setTasks(updatedTasks);
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleMoveTask = async (taskId, nextStatus) => {
    const task = tasks.find(item => item.id === taskId);
    if (!task || !activeBoard?.id) return;
    const currentStatus = (task.status || 'pending').toLowerCase();
    if (currentStatus === nextStatus) return;

    try {
      await updateTask(task.id, {
        ...task,
        status: nextStatus,
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id);
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to move task');
    }
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar 
        boards={boards}
        activeBoard={activeBoard}
        onBoardSelect={setActiveBoard}
        onCreateBoard={handleCreateBoard}
        onEditBoard={(board) => {
          setEditingBoard(board);
          setShowEditBoardModal(true);
        }}
        onDeleteBoard={handleDeleteBoard}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="dashboard-content">
        <Navbar onSidebarToggle={toggleSidebar} />
        
        <Container fluid className="dashboard-container">
          <div className="dashboard-header">
            <div className="dashboard-header-left">
              <button
                className="btn btn-secondary dashboard-menu-btn"
                type="button"
                onClick={toggleSidebar}
                aria-label="Toggle boards"
              >
                <i className="fas fa-bars"></i>
              </button>
              <h1>{activeBoard?.name || 'Select a Board'}</h1>
            </div>
            <button 
              className="btn btn-primary"
              disabled={!activeBoard}
              onClick={() => setShowTaskModal(true)}
            >
              <i className="fas fa-plus me-2"></i>New Task
            </button>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {activeBoard ? (
            <>
              <Row className="stats-grid">
                <Col xl={3} md={6}>
                  <StatsCard 
                    title="Total Tasks"
                    value={tasks.length}
                    variant="primary"
                    icon="fa-clipboard-list"
                  />
                </Col>
                <Col xl={3} md={6}>
                  <StatsCard 
                    title="Pending Tasks"
                    value={tasks.filter(t => t.status === 'pending').length}
                    variant="warning"
                    icon="fa-clock"
                  />
                </Col>
                <Col xl={3} md={6}>
                  <StatsCard 
                    title="Completed Tasks"
                    value={tasks.filter(t => t.status === 'completed').length}
                    variant="success"
                    icon="fa-check-circle"
                  />
                </Col>
              </Row>

              <Card className="task-list-card">
                <Card.Header className="task-list-header">
                  <h3>{activeBoard.name} Tasks</h3>
                </Card.Header>
                <Card.Body>
                  <TaskList 
                    tasks={tasks}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onMoveTask={handleMoveTask}
                  />
                </Card.Body>
              </Card>
            </>
          ) : (
            <div className="board-prompt">
              <h2>📋 Select or Create a Board to Get Started</h2>
            </div>
          )}

          {/* Task Creation Modal */}
          <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Create New Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleCreateTask}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Create Task
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Task Edit Modal */}
          <Modal show={showEditTaskModal} onHide={() => setShowEditTaskModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Task</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateTask}>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingTask?.title || ''}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editingTask?.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={(editingTask?.status || 'pending').toLowerCase()}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={(editingTask?.priority || 'medium').toLowerCase()}
                    onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowEditTaskModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

          {/* Board Edit Modal */}
          <Modal show={showEditBoardModal} onHide={() => setShowEditBoardModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Board</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleUpdateBoard}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingBoard?.name || ''}
                    onChange={(e) => setEditingBoard({...editingBoard, name: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editingBoard?.description || ''}
                    onChange={(e) => setEditingBoard({...editingBoard, description: e.target.value})}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button variant="secondary" className="me-2" onClick={() => setShowEditBoardModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Container>
      </div>
    </div>
  );
};
export default Dashboard;