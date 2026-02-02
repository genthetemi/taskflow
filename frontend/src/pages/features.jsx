import React from 'react';
import '../styles/home.css';

const Features = () => {
  return (
    <div className="container mt-5 pt-4">
      <div className="section-header text-center">
        <h1>Features</h1>
        <p className="section-subtitle">Everything you need to manage tasks effectively</p>
      </div>

      <div className="row mt-4">
        <div className="col-md-4 text-center">
          <div className="feature-icon mb-3">
            <i className="fas fa-columns fa-2x"></i>
          </div>
          <h4>Kanban Boards</h4>
          <p>Visualize your workflow with drag-and-drop boards for every project.</p>
        </div>

        <div className="col-md-4 text-center">
          <div className="feature-icon mb-3">
            <i className="fas fa-tags fa-2x"></i>
          </div>
          <h4>Smart Labels</h4>
          <p>Categorize and filter tasks with custom labels and priority levels.</p>
        </div>

        <div className="col-md-4 text-center">
          <div className="feature-icon mb-3">
            <i className="fas fa-chart-line fa-2x"></i>
          </div>
          <h4>Progress Tracking</h4>
          <p>Monitor productivity with detailed analytics and progress reports.</p>
        </div>
      </div>
    </div>
  );
};

export default Features;
