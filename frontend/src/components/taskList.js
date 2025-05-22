import React from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';

const TaskList = ({ tasks, loading, error }) => {
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

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id}>
            <td>{task.title}</td>
            <td>{task.description || '—'}</td>
            <td>
              <span className={`badge bg-${task.status === 'completed' ? 'success' : 'warning'}`}>
                {task.status}
              </span>
            </td>
            <td>
              <span className={`badge bg-${
                task.priority === 'high' ? 'danger' : 
                task.priority === 'medium' ? 'warning' : 'info'
              }`}>
                {task.priority}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TaskList;