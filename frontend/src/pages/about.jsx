import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const About = () => {
  return (
    <div className="container mt-5 pt-4">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h1>About TaskFlow</h1>
          <p className="lead">
            TaskFlow is a lightweight, intuitive task and project management app built to
            help individuals and teams stay organized and productive.
          </p>
          <p>
            We focus on simple clean design, powerful features like Kanban boards, labels,
            and progress tracking, and an easy onboarding experience so you can get started quickly.
          </p>
          <Link to="/features" className="btn btn-outline-primary">
            See Features
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
