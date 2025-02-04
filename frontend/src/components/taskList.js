import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { fetchTasks } from '../services/tasks';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading tasks...</span>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" className="mt-4">{error}</Alert>;
  }

  return (
    <Table striped bordered hover className="mt-4">
      <thead>
        <tr>
          <th>Title</th>
          <th>Description</th>
          <th>Status</th>
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
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TaskList; 