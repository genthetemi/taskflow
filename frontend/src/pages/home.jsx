import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import Navbar from '../components/navbar'; // Import the Navbar component
import { FiLayers, FiPlusSquare, FiBarChart2, FiColumns, FiTag, FiUsers, FiCloud, FiShield } from 'react-icons/fi';
import '../styles/home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Use the existing Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title">
                ORGANIZE YOUR WORK, <span className="highlight">BOOST PRODUCTIVITY</span>
              </h1>
              <p className="hero-subtitle">
                TaskFlow is the brutalist task management platform that helps teams and individuals organize, track, and complete work efficiently. No fluff. No filler.
              </p>
              <div className="hero-cta">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    GO TO DASHBOARD
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg me-3">
                      START FREE TRIAL
                    </Link>
                    <Link to="/login" className="btn btn-outline-primary btn-lg">
                      SIGN IN
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dot red"></div>
                  <div className="preview-dot yellow"></div>
                  <div className="preview-dot green"></div>
                </div>
                <div className="preview-content">
                  <div className="preview-task completed">
                    <span>✓ COMPLETE PROJECT PROPOSAL</span>
                  </div>
                  <div className="preview-task in-progress">
                    <span>→ REVIEW TEAM UPDATES</span>
                  </div>
                  <div className="preview-task pending">
                    <span>○ SCHEDULE MEETING</span>
                  </div>
                  <div className="preview-task high-priority">
                    <span>⚠️ FINALIZE PRESENTATION</span>
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
            <h2>POWERFUL FEATURES FOR MODERN TEAMS</h2>
            <p className="section-subtitle">
              Everything you need to manage tasks effectively
            </p>
          </div>
          <div className="row">
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiColumns size={28} />
              </div>
              <h3>KANBAN BOARDS</h3>
              <p>Visualize your workflow with drag-and-drop boards for every project.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiTag size={28} />
              </div>
              <h3>SMART LABELS</h3>
              <p>Categorize and filter tasks with custom labels and priority levels.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiBarChart2 size={28} />
              </div>
              <h3>PROGRESS TRACKING</h3>
              <p>Monitor productivity with detailed analytics and progress reports.</p>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiUsers size={28} />
              </div>
              <h3>TEAM COLLABORATION</h3>
              <p>Assign tasks, mention teammates, and keep everyone aligned.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiCloud size={28} />
              </div>
              <h3>CLOUD SYNC</h3>
              <p>Access from any device. Changes sync instantly across platforms.</p>
            </div>
            <div className="col-md-4 feature-card">
              <div className="feature-icon">
                <FiShield size={28} />
              </div>
              <h3>ENTERPRISE SECURITY</h3>
              <p>Bank-level encryption, role-based access, and compliance standards.</p>
            </div>
          </div>
          <div className="text-center mt-5">
            <Link to="/features" className="btn btn-primary">
              VIEW ALL FEATURES
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <h3>35K+</h3>
              <p>TASKS COMPLETED</p>
            </div>
            <div className="stat">
              <h3>12K+</h3>
              <p>ACTIVE USERS</p>
            </div>
            <div className="stat">
              <h3>4.8</h3>
              <p>AVERAGE RATING</p>
            </div>
            <div className="stat">
              <h3>99.9%</h3>
              <p>UPTIME</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <h2>HOW TASKFLOW WORKS</h2>
            <p className="section-subtitle">Simple steps to get your team moving</p>
          </div>
          <div className="how-grid">
            <Link to="/features" className="how-step" title="Create a Board">
              <div className="step-icon"><FiLayers size={24} /></div>
              <div className="step-number">1</div>
              <h4>CREATE A BOARD</h4>
              <p>Set up a board for any project and invite your teammates.</p>
            </Link>

            <Link to="/features" className="how-step" title="Add Tasks">
              <div className="step-icon"><FiPlusSquare size={24} /></div>
              <div className="step-number">2</div>
              <h4>ADD TASKS</h4>
              <p>Break work into tasks, add due dates, labels, and assignees.</p>
            </Link>

            <Link to="/dashboard" className="how-step" title="Track Progress">
              <div className="step-icon"><FiBarChart2 size={24} /></div>
              <div className="step-number">3</div>
              <h4>TRACK PROGRESS</h4>
              <p>Move tasks across columns and see progress at a glance.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>WHAT OUR USERS SAY</h2>
            <p className="section-subtitle">Real teams, real results</p>
          </div>

          <div className="testimonials-grid" role="list">
            <div className="testimonial-card" role="listitem">
              <div className="meta">
                <div className="avatar">MG</div>
                <div className="meta-info">
                  <div className="name">MARIA G.</div>
                  <div className="role">PRODUCT MANAGER</div>
                </div>
                <div className="rating" aria-label="4 out of 5 stars">★★★★☆</div>
              </div>
              <p className="quote">"TaskFlow made planning our sprints a breeze. We ship faster and stay aligned."</p>
            </div>

            <div className="testimonial-card" role="listitem">
              <div className="meta">
                <div className="avatar">JK</div>
                <div className="meta-info">
                  <div className="name">JAMES K.</div>
                  <div className="role">CTO</div>
                </div>
                <div className="rating" aria-label="5 out of 5 stars">★★★★★</div>
              </div>
              <p className="quote">"Intuitive and lightweight — our team adopted it in days."</p>
            </div>

            <div className="testimonial-card" role="listitem">
              <div className="meta">
                <div className="avatar">AR</div>
                <div className="meta-info">
                  <div className="name">AISHA R.</div>
                  <div className="role">ENGINEERING LEAD</div>
                </div>
                <div className="rating" aria-label="5 out of 5 stars">★★★★★</div>
              </div>
              <p className="quote">"Great UX and solid features. The analytics helped us improve delivery."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>READY TO TRANSFORM YOUR WORKFLOW?</h2>
          <p>Join thousands of teams already using TaskFlow to stay organized and productive.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            GET STARTED FOR FREE
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>TASKFLOW</h5>
              <p>Making task management simple and effective for everyone.</p>
            </div>
            <div className="col-md-2">
              <h6>PRODUCT</h6>
              <ul>
                <li><Link to="/features">FEATURES</Link></li>
                <li><Link to="/pricing">PRICING</Link></li>
                <li><Link to="/dashboard">DEMO</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>COMPANY</h6>
              <ul>
                <li><Link to="/about">ABOUT</Link></li>
                <li><Link to="/blog">BLOG</Link></li>
                <li><Link to="/contact">CONTACT</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>LEGAL</h6>
              <ul>
                <li><Link to="/privacy">PRIVACY</Link></li>
                <li><Link to="/terms">TERMS</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 TASKFLOW. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;