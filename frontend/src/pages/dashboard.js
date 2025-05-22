import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Modal, Form } from 'react-bootstrap';
import Navbar from '../components/navbar';
import TaskList from '../components/taskList';
import Sidebar from '../components/sidebar';
import StatsCard from '../components/statsCard';
import { fetchTasks, createTask } from '../services/tasks';
import { fetchBoards, createBoard } from '../services/boards';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });

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

  const handleCreateBoard = async (boardName) => {
    try {
      const newBoard = await createBoard({
        name: boardName,
        description: `Board for ${boardName} tasks`
      });
      
      // Refresh boards list and auto-select new board
      const updatedBoards = await fetchBoards();
      setBoards(updatedBoards);
      setActiveBoard(newBoard);
      
    } catch (err) {
      setError('Failed to create board');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTask,
        board_id: activeBoard.id
      });
      
      // Refresh tasks list
      const updatedTasks = await fetchTasks(activeBoard.id);
      setTasks(updatedTasks);
      
      // Reset form and close modal
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

  return (
    <div className="dashboard-wrapper">
      <Sidebar 
        boards={boards}
        activeBoard={activeBoard}
        onBoardSelect={setActiveBoard}
        onCreateBoard={handleCreateBoard}
      />
      
      <div className="dashboard-content">
        <Navbar />
        
        <Container fluid className="dashboard-container">
          <div className="dashboard-header">
            <h1>{activeBoard?.name || 'Select a Board'}</h1>
            <button 
              className="btn-primary"
              disabled={!activeBoard}
              onClick={() => setShowTaskModal(true)}
            >
              <i className="fas fa-plus me-2"></i>New Task
            </button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

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
              </Row>

              <Card className="task-list-card">
                <Card.Header className="task-list-header">
                  <h3>{activeBoard.name} Tasks</h3>
                  <select className="filter-select">
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Completed</option>
                  </select>
                </Card.Header>
                <Card.Body>
                  <TaskList tasks={tasks} />
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
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2" 
                    onClick={() => setShowTaskModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Task
                  </button>
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