import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Container, Card, Alert, Modal, Form, Button } from 'react-bootstrap';
import { io } from 'socket.io-client';
import Navbar from '../components/navbar';
import TaskList from '../components/taskList';
import Sidebar from '../components/sidebar';
import StatsCard from '../components/statsCard';
import TaskDetailModal from '../components/taskDetailModal';
import BoardChat from '../components/boardChat';
import { fetchTasks, createTask, updateTask, deleteTask, fetchTaskComments, createTaskComment } from '../services/tasks';
import { fetchBoardChatMessages, createBoardChatMessage } from '../services/chat';
import {
  fetchBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  inviteBoardUser,
  fetchBoardUsers,
  fetchBoardInvitations,
  respondToBoardInvitation
} from '../services/boards';
import '../styles/dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const { user } = useAuth();
  // State declarations
  const [tasks, setTasks] = useState([]);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [boardUsers, setBoardUsers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitations, setInvitations] = useState([]);
  const [isInvitesLoading, setIsInvitesLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditBoardModal, setShowEditBoardModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [taskCommentDraft, setTaskCommentDraft] = useState('');
  const [commentsError, setCommentsError] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('due-date');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    assignee_user_id: ''
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [chatError, setChatError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const socketRef = useRef(null);

  const normalizeStatus = (status) =>
    String(status || 'pending').trim().toLowerCase().replace(/\s+/g, '-');

  const getErrorMessage = (err, fallbackMessage) =>
    err?.response?.data?.error || err?.message || fallbackMessage;

  const normalizeAssignee = (value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  };

  const countByStatus = (status) =>
    tasks.filter((task) => normalizeStatus(task.status) === status).length;

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  const formatDateTimeInput = (value) => {
    if (!value) {
      return '';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const offset = parsedDate.getTimezoneOffset();
    const localDate = new Date(parsedDate.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const getVisibleTasks = () => {
    const filteredTasks = tasks.filter((task) => {
      const normalizedTaskStatus = normalizeStatus(task.status);
      const normalizedTaskPriority = String(task.priority || 'medium').toLowerCase();
      const taskAssignee = task.assignee_user_id === null || task.assignee_user_id === undefined
        ? 'unassigned'
        : String(task.assignee_user_id);

      const matchesStatus = statusFilter === 'all' || normalizedTaskStatus === statusFilter;
      const matchesPriority = priorityFilter === 'all' || normalizedTaskPriority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || taskAssignee === assigneeFilter;

      return matchesStatus && matchesPriority && matchesAssignee;
    });

    return filteredTasks.sort((firstTask, secondTask) => {
      if (sortBy === 'priority') {
        const priorityRank = { high: 0, medium: 1, low: 2 };
        return priorityRank[String(firstTask.priority || 'medium').toLowerCase()] - priorityRank[String(secondTask.priority || 'medium').toLowerCase()];
      }

      if (sortBy === 'created-date') {
        return new Date(secondTask.created_at || 0) - new Date(firstTask.created_at || 0);
      }

      return new Date(firstTask.due_date || 8640000000000000) - new Date(secondTask.due_date || 8640000000000000);
    });
  };

  const loadTaskComments = async (taskId) => {
    try {
      setIsCommentsLoading(true);
      setCommentsError('');
      const comments = await fetchTaskComments(taskId);
      setTaskComments(comments || []);
    } catch (err) {
      setCommentsError(getErrorMessage(err, 'Failed to load comments'));
      setTaskComments([]);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const loadBoardChatMessages = useCallback(async (boardId) => {
    try {
      setIsChatLoading(true);
      setChatError('');
      const data = await fetchBoardChatMessages(boardId);
      setChatMessages(data || []);
    } catch (err) {
      setChatError(getErrorMessage(err, 'Failed to load board chat'));
      setChatMessages([]);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  const loadInvitations = async () => {
    try {
      setIsInvitesLoading(true);
      const data = await fetchBoardInvitations();
      setInvitations(data || []);
    } catch {
      setInvitations([]);
    } finally {
      setIsInvitesLoading(false);
    }
  };

  // Toggle task status helper: pending -> in-progress -> completed -> pending
  const handleToggleStatus = async (task) => {
    try {
      const order = ['pending', 'in-progress', 'completed'];
      const idx = order.indexOf((task.status || 'pending').toLowerCase());
      const next = order[(idx + 1) % order.length];
      await updateTask(task.id, { status: next, board_id: activeBoard?.id });
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

  useEffect(() => {
    loadInvitations();
    const intervalId = setInterval(loadInvitations, 20000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const socket = io(API_URL, {
      auth: { token }
    });

    socket.on('board_message', (newMessage) => {
      if (!activeBoard?.id || Number(newMessage.boardId) !== Number(activeBoard.id)) {
        return;
      }

      setChatMessages((prev) => [...prev, newMessage].slice(-100));
    });

    socket.on('connect', () => {
      if (activeBoard?.id) {
        socket.emit('join_board', { boardId: activeBoard.id });
      }
    });

    socket.on('chat_error', (payload = {}) => {
      setChatError(payload.message || 'Chat error');
    });

    socket.on('connect_error', () => {
      setChatError('Realtime chat unavailable. Fallback send is enabled.');
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeBoard?.id]);

  useEffect(() => {
    if (!activeBoard?.id) {
      setChatMessages([]);
      setIsChatOpen(false);
      return undefined;
    }

    const boardId = activeBoard.id;
    loadBoardChatMessages(boardId);
    setChatError('');

    if (socketRef.current?.connected) {
      socketRef.current.emit('join_board', { boardId });
    }

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('leave_board', { boardId });
      }
    };
  }, [activeBoard?.id, loadBoardChatMessages]);

  // Load board users when board changes
  useEffect(() => {
    const loadBoardUsersData = async () => {
      try {
        if (!activeBoard?.id) {
          setBoardUsers([]);
          return;
        }

        const boardUsersData = await fetchBoardUsers(activeBoard.id);
        setBoardUsers(boardUsersData || []);
      } catch (error) {
        setError(getErrorMessage(error, 'Failed to load board users'));
        setBoardUsers([]);
      }
    };
    loadBoardUsersData();
  }, [activeBoard]);

  // Load tasks when board or search changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (!activeBoard?.id) {
          setTasks([]);
          return;
        }

        setIsTasksLoading(true);
        const taskData = await fetchTasks(activeBoard.id, { query: searchQuery.trim() });
        setTasks(taskData);
      } catch (error) {
        setError(getErrorMessage(error, 'Failed to load tasks'));
        setTasks([]);
      } finally {
        setIsTasksLoading(false);
      }
    };

    loadTasks();
  }, [activeBoard, searchQuery]);

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

  const handleInviteBoard = async (boardId, email) => {
    try {
      setIsInviting(true);
      await inviteBoardUser(boardId, email);
      setSuccess(`Invitation sent to ${email}`);
      setError('');
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      setError(err.message || 'Failed to invite user');
      setSuccess('');
    } finally {
      setIsInviting(false);
    }
  };

  const handleInvitationResponse = async (invitationId, action) => {
    try {
      await respondToBoardInvitation(invitationId, action);
      await loadInvitations();
      if (action === 'accept') {
        const updatedBoards = await fetchBoards();
        setBoards(updatedBoards);
      }
      setSuccess(action === 'accept' ? 'Invitation accepted' : 'Invitation rejected');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to respond to invitation');
      setSuccess('');
    }
  };

  // Task handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...newTask,
        due_date: newTask.due_date || null,
        assignee_user_id: normalizeAssignee(newTask.assignee_user_id),
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id, { query: searchQuery.trim() });
      setTasks(updatedTasks);
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        assignee_user_id: ''
      });
      setShowTaskModal(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create task'));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      status: normalizeStatus(task.status),
      priority: String(task.priority || 'medium').toLowerCase(),
      due_date: formatDateTimeInput(task.due_date),
      assignee_user_id: task.assignee_user_id ?? ''
    });
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateTask(editingTask.id, {
        ...editingTask,
        due_date: editingTask.due_date || null,
        assignee_user_id: normalizeAssignee(editingTask.assignee_user_id),
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id, { query: searchQuery.trim() });
      setTasks(updatedTasks);
      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update task'));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        const updatedTasks = await fetchTasks(activeBoard.id, { query: searchQuery.trim() });
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
        status: nextStatus,
        board_id: activeBoard.id
      });
      const updatedTasks = await fetchTasks(activeBoard.id, { query: searchQuery.trim() });
      setTasks(updatedTasks);
    } catch (err) {
      setError('Failed to move task');
    }
  };

  const handleOpenTaskDetails = async (task) => {
    setSelectedTask(task);
    setTaskCommentDraft('');
    setShowTaskDetailsModal(true);
    await loadTaskComments(task.id);
  };

  const handleSubmitTaskComment = async (event) => {
    event.preventDefault();

    if (!selectedTask?.id || !taskCommentDraft.trim()) {
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentsError('');
      await createTaskComment(selectedTask.id, taskCommentDraft.trim());
      setTaskCommentDraft('');
      await loadTaskComments(selectedTask.id);
    } catch (err) {
      setCommentsError(getErrorMessage(err, 'Failed to post comment'));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSendBoardMessage = async (event) => {
    event.preventDefault();

    const content = chatDraft.trim();
    if (!content || !activeBoard?.id) {
      return;
    }

    try {
      setIsSendingChat(true);
      setChatError('');

      if (socketRef.current?.connected) {
        socketRef.current.emit('send_board_message', {
          boardId: activeBoard.id,
          message: content
        });
      } else {
        const createdMessage = await createBoardChatMessage(activeBoard.id, content);
        setChatMessages((prev) => [...prev, createdMessage].slice(-100));
      }

      setChatDraft('');
    } catch (err) {
      setChatError(getErrorMessage(err, 'Failed to send message'));
    } finally {
      setIsSendingChat(false);
    }
  };

  const visibleTasks = getVisibleTasks();
  const overdueCount = visibleTasks.filter((task) => task.due_date && new Date(task.due_date) < new Date()).length;
  const assignedToMeCount = visibleTasks.filter((task) => Number(task.assignee_user_id) === Number(user?.id)).length;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

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
        <Navbar
          onSidebarToggle={toggleSidebar}
          notificationsCount={invitations.length}
          notifications={invitations}
          isNotificationsLoading={isInvitesLoading}
          onRespondInvitation={handleInvitationResponse}
        />
        
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
            <div className="dashboard-header-actions">
              <button
                className="btn btn-secondary"
                disabled={!activeBoard}
                onClick={() => setShowInviteModal(true)}
              >
                <i className="fas fa-user-plus me-2"></i>Invite User
              </button>
              <button 
                className="btn btn-primary"
                disabled={!activeBoard}
                onClick={() => setShowTaskModal(true)}
              >
                <i className="fas fa-plus me-2"></i>New Task
              </button>
            </div>
          </div>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          {activeBoard ? (
            <>
              <div className="dashboard-stats-grid">
                <div className="dashboard-stats-item">
                  <StatsCard 
                      title="Visible Tasks"
                      value={visibleTasks.length}
                    variant="primary"
                    icon="fa-clipboard-list"
                  />
                </div>
                <div className="dashboard-stats-item">
                  <StatsCard 
                    title="Pending Tasks"
                    value={countByStatus('pending')}
                    variant="warning"
                    icon="fa-clock"
                  />
                </div>
                <div className="dashboard-stats-item">
                  <StatsCard 
                    title="In Progress Tasks"
                    value={countByStatus('in-progress')}
                    variant="info"
                    icon="fa-spinner"
                  />
                </div>
                <div className="dashboard-stats-item">
                  <StatsCard 
                    title="Overdue / Mine"
                    value={`${overdueCount} / ${assignedToMeCount}`}
                    variant="success"
                    icon="fa-bolt"
                  />
                </div>
              </div>

              <Card className="task-list-card">
                <Card.Header className="task-list-header">
                  <h3>{activeBoard.name} Tasks</h3>
                  <div className="task-toolbar">
                    <Form.Control
                      type="search"
                      placeholder="Search tasks"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="task-search-input"
                    />
                    <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                    <Form.Select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                    <Form.Select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
                      <option value="all">All Assignees</option>
                      <option value="unassigned">Unassigned</option>
                      {boardUsers.map((boardUser) => (
                        <option key={boardUser.id} value={String(boardUser.id)}>
                          {boardUser.email}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                      <option value="due-date">Sort by Due Date</option>
                      <option value="priority">Sort by Priority</option>
                      <option value="created-date">Sort by Created Date</option>
                    </Form.Select>
                  </div>
                </Card.Header>
                <Card.Body>
                  <TaskList 
                    tasks={visibleTasks}
                    loading={isTasksLoading}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                    onMoveTask={handleMoveTask}
                    onViewTask={handleOpenTaskDetails}
                  />
                </Card.Body>
              </Card>

            </>
          ) : (
            <div className="board-prompt">
              <h2>📋 Select or Create a Board to Get Started</h2>
            </div>
          )}

          <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Invite User to {activeBoard?.name || 'Board'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!activeBoard?.id || !inviteEmail.trim()) return;
                  handleInviteBoard(activeBoard.id, inviteEmail.trim());
                }}
              >
                <Form.Group className="mb-3">
                  <Form.Label>User Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    className="me-2"
                    onClick={() => setShowInviteModal(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={!inviteEmail.trim() || isInviting}>
                    {isInviting ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

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

                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Assign To</Form.Label>
                  <Form.Select
                    value={newTask.assignee_user_id}
                    onChange={(e) => setNewTask({...newTask, assignee_user_id: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {boardUsers.map((boardUser) => (
                      <option key={boardUser.id} value={boardUser.id}>
                        {boardUser.email} {boardUser.role === 'owner' ? '(Owner)' : ''}
                      </option>
                    ))}
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

                <Form.Group className="mb-3">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={editingTask?.due_date || ''}
                    onChange={(e) => setEditingTask({...editingTask, due_date: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Assign To</Form.Label>
                  <Form.Select
                    value={editingTask?.assignee_user_id ?? ''}
                    onChange={(e) => setEditingTask({...editingTask, assignee_user_id: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {boardUsers.map((boardUser) => (
                      <option key={boardUser.id} value={boardUser.id}>
                        {boardUser.email} {boardUser.role === 'owner' ? '(Owner)' : ''}
                      </option>
                    ))}
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

          <TaskDetailModal
            show={showTaskDetailsModal}
            task={selectedTask}
            comments={taskComments}
            commentValue={taskCommentDraft}
            commentsError={commentsError}
            isCommentsLoading={isCommentsLoading}
            isSubmittingComment={isSubmittingComment}
            onClose={() => {
              setShowTaskDetailsModal(false);
              setSelectedTask(null);
              setTaskComments([]);
              setTaskCommentDraft('');
              setCommentsError('');
            }}
            onCommentChange={setTaskCommentDraft}
            onSubmitComment={handleSubmitTaskComment}
          />

          <BoardChat
            isActiveBoard={Boolean(activeBoard?.id)}
            isOpen={isChatOpen}
            messages={chatMessages}
            draft={chatDraft}
            loading={isChatLoading}
            sending={isSendingChat}
            error={chatError}
            onToggle={() => setIsChatOpen((prev) => !prev)}
            onDraftChange={setChatDraft}
            onSendMessage={handleSendBoardMessage}
          />
        </Container>
      </div>
    </div>
  );
};
export default Dashboard;