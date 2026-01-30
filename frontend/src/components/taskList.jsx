import React from 'react';
import { Spinner, Alert, Badge } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';

const TaskList = ({ tasks, loading, error, onEditTask, onDeleteTask }) => {
  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!tasks.length) {
    return <Alert variant="info">No tasks found for this board.</Alert>;
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#0dcaf0';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': 
        return <FiCheckCircle style={{ color: '#198754' }} />;
      case 'in-progress': 
        return <FiClock style={{ color: '#ffc107' }} />;
      case 'pending': 
      default:
        return <FiCircle style={{ color: '#6c757d' }} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case 'in-progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div className="tasks-grid">
      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          <div className="task-header">
            <div className="task-title-section">
              {getStatusIcon(task.status)}
              <h4 className="task-title">{task.title}</h4>
            </div>
            <div className="task-actions">
              <button
                className="task-action-btn edit-btn"
                onClick={() => onEditTask(task)}
                title="Edit task"
              >
                <FiEdit2 />
              </button>
              <button
                className="task-action-btn delete-btn"
                onClick={() => onDeleteTask(task.id)}
                title="Delete task"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-footer">
            <Badge bg={task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'secondary'}>
              {getStatusLabel(task.status)}
            </Badge>
            <Badge 
              style={{ 
                backgroundColor: getPriorityColor(task.priority),
                marginLeft: '0.5rem'
              }}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;