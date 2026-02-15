import React from 'react';
import { Spinner, Alert, Badge } from 'react-bootstrap';
import { FiEdit2, FiTrash2, FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';

const TaskList = ({ tasks, loading, error, onEditTask, onDeleteTask, onToggleStatus, onMoveTask }) => {
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
    switch (String(priority || 'medium').toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#0dcaf0';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (String(status || 'pending').toLowerCase()) {
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
    switch (String(status || 'pending').toLowerCase()) {
      case 'in-progress':
        return 'In Progress';
      default:
        return String(status || 'pending').charAt(0).toUpperCase() + String(status || 'pending').slice(1);
    }
  };

  const normalizeStatus = (status) => {
    return String(status || 'pending')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/_+/g, '-');
  };

  const columns = [
    { key: 'pending', label: 'Pending' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  const handleDrop = (event, status) => {
    event.preventDefault();
    const rawId = event.dataTransfer.getData('text/plain');
    const taskId = Number(rawId);
    if (!Number.isNaN(taskId) && typeof onMoveTask === 'function') {
      onMoveTask(taskId, status);
    }
  };

  return (
    <div className="tasks-board">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => {
          return normalizeStatus(task.status) === column.key;
        });
        return (
          <div
            key={column.key}
            className="task-column"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, column.key)}
          >
            <div className="column-header">
              <h4 className="column-title">{column.label}</h4>
              <span className="column-count">{columnTasks.length}</span>
            </div>
            <div className="column-body">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', String(task.id));
                  }}
                >
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

                  <div className="task-assignee">
                    <strong>Assignee:</strong> {task.assignee_email || 'Unassigned'}
                  </div>

                  <div className="task-footer">
                    <button
                      className={`badge status-badge ${normalizeStatus(task.status)}`}
                      onClick={() => typeof onToggleStatus === 'function' && onToggleStatus(task)}
                      title="Change status"
                    >
                      {getStatusLabel(normalizeStatus(task.status))}
                    </button>
                    <Badge
                      style={{
                        backgroundColor: getPriorityColor(task.priority),
                        marginLeft: '0.5rem'
                      }}
                    >
                      {String(task.priority || 'medium').charAt(0).toUpperCase() + String(task.priority || 'medium').slice(1)} Priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskList;