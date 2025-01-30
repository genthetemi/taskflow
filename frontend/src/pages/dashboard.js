import { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Navbar from '../components/navbar';
import TaskList from '../components/taskList';
import { fetchTasks } from '../services/tasks';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      }
    };
    loadTasks();
  }, []);

  return (
    <>
      <Navbar />
      <Container fluid>
        <Row className="mt-4">
          <Col>
            <Card>
              <Card.Body>
                <h4>Task List</h4>
                <TaskList tasks={tasks} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;