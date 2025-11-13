import React from 'react';
import { Table, Spinner, Alert, Button, Badge } from 'react-bootstrap';

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

  const getPriorityBadgeVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.description || '—'}</td>
            <td>
              <Badge bg={task.status === 'completed' ? 'success' : 'warning'}>
                {task.status}
              </Badge>
            </td>
            <td>
              <Badge bg={getPriorityBadgeVariant(task.priority)}>
                {task.priority}
              </Badge>
            </td>
            <td>
              <Button
                variant="outline-primary"
                size="sm"
                className="me-2"
                onClick={() => onEditTask(task)}
              >
                Edit
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => onDeleteTask(task.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TaskList;