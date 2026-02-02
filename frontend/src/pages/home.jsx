import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <span className="brand-text">TaskFlow</span>
          </Link>
          <div className="d-flex">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-primary me-2">
                  Login
                </Link>
                <Link to="/dashboard" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title">
                Organize Your Work, <span className="highlight">Boost Productivity</span>
              </h1>
              <p className="hero-subtitle">
                TaskFlow is the intuitive task management platform that helps teams and individuals 
                organize, track, and complete work efficiently.
              </p>
              <div className="hero-cta">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className="btn btn-primary btn-lg me-3">
                      Start Free Trial
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                {/* You can add an illustration here */}
                <div className="dashboard-preview">
                  <div className="preview-header">
                    <div className="preview-dot red"></div>
                    <div className="preview-dot yellow"></div>
                    <div className="preview-dot green"></div>
                  </div>
                  <div className="preview-content">
                    <div className="preview-task completed">
                      <span>✓ Complete project proposal</span>
                    </div>
                    <div className="preview-task in-progress">
                      <span>→ Review team updates</span>
                    </div>
                    <div className="preview-task pending">
                      <span>○ Schedule meeting</span>
                    </div>
                    <div className="preview-task high-priority">
                      <span>⚠️ Finalize presentation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Powerful Features for Modern Teams</h2>
            <p className="section-subtitle">
              Everything you need to manage tasks effectively
            </p>
          </div>
          <div className="row">
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <i className="fas fa-columns"></i>
              </div>
              <h3>Kanban Boards</h3>
              <p>Visualize your workflow with drag-and-drop boards for every project.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h3>Smart Labels</h3>
              <p>Categorize and filter tasks with custom labels and priority levels.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Progress Tracking</h3>
              <p>Monitor productivity with detailed analytics and progress reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Workflow?</h2>
          <p>Join thousands of teams already using TaskFlow to stay organized and productive.</p>
          <Link to="/dashboard" className="btn btn-primary btn-lg">
            Get Started For Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>TaskFlow</h5>
              <p>Making task management simple and effective for everyone.</p>
            </div>
            <div className="col-md-2">
              <h6>Product</h6>
              <ul>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/dashboard">Demo</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>Company</h6>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>Legal</h6>
              <ul>
                <li><Link to="/privacy">Privacy</Link></li>
                <li><Link to="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;