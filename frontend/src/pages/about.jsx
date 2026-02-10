import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { 
  FiUsers, 
  FiTarget, 
  FiGlobe, 
  FiHeart, 
  FiCode,
  FiStar
} from 'react-icons/fi';
import '../styles/about.css';

const About = () => {
  const team = [
    { name: 'ALEX CHEN', role: 'FOUNDER & CEO', bio: '10+ years in product design. Built 3 startups before TaskFlow.' },
    { name: 'SAMIRA KHAN', role: 'CTO', bio: 'Ex-Google engineer. Focus on scalable architecture and security.' },
    { name: 'MARCOS RODRIGUEZ', role: 'HEAD OF DESIGN', bio: 'Brutalist design advocate. Previous work at Figma and Adobe.' },
    { name: 'JAMIE PARKER', role: 'LEAD DEVELOPER', bio: 'Full-stack wizard. Loves React and minimalist code.' }
  ];

  const milestones = [
    { year: '2022', title: 'FOUNDED', desc: 'Started with 3 people in a garage. Built first prototype.' },
    { year: '2023', title: 'LAUNCH', desc: 'Public beta with 1,000 early users. First funding round.' },
    { year: '2024', title: 'SCALE', desc: '10,000+ active teams. Enterprise partnerships secured.' }
  ];

  const values = [
    { icon: <FiTarget />, title: 'SIMPLICITY', desc: 'Remove complexity. Focus on what matters.' },
    { icon: <FiUsers />, title: 'TRANSPARENCY', desc: 'No hidden features. Clear pricing, clear value.' },
    { icon: <FiCode />, title: 'QUALITY', desc: 'Code that lasts. Design that works.' },
    { icon: <FiHeart />, title: 'IMPACT', desc: 'Help teams do their best work. Every day.' }
  ];

  return (
    <div className="about-container">
      <Navbar />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title">
                BUILDING <span className="highlight">BETTER</span> WORK
              </h1>
              <p className="hero-sub">
                We believe task management should be simple, powerful, and focused. 
                No distractions. No unnecessary features. Just tools that help you get work done.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">12K+</div>
                  <div className="stat-label">ACTIVE TEAMS</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">35K+</div>
                  <div className="stat-label">TASKS DAILY</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">UPTIME</div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="brutal-frame">
                <div className="frame-header">
                  <div className="frame-dots">
                    <div className="dot red"></div>
                    <div className="dot yellow"></div>
                    <div className="dot green"></div>
                  </div>
                </div>
                <div className="frame-content">
                  <div className="quote">
                    "WE BUILD TOOLS THAT DISAPPEAR INTO THE WORK. 
                    WHEN DONE RIGHT, YOU SHOULDN'T NOTICE THE SOFTWARE—JUST THE PROGRESS."
                  </div>
                  <div className="quote-author">— TASKFLOW TEAM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">OUR MISSION</h2>
            <div className="section-line"></div>
          </div>
          <div className="mission-card">
            <div className="mission-icon">
              <FiGlobe size={48} />
            </div>
            <h3>MAKE WORK MEANINGFUL</h3>
            <p className="mission-text">
              We're tired of bloated software that gets in the way. TaskFlow strips away everything 
              unnecessary, leaving only what helps teams collaborate and ship great work. We believe 
              in brutal honesty—in our design, our pricing, and our communication.
            </p>
            <p className="mission-text">
              Our goal isn't to be the biggest task management tool. It's to be the most honest one.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">OUR VALUES</h2>
            <div className="section-line"></div>
          </div>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  {value.icon}
                </div>
                <h4>{value.title}</h4>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">THE TEAM</h2>
            <div className="section-line"></div>
            <p className="section-sub">
              Small team. Big impact. We're builders who actually use what we create.
            </p>
          </div>
          <div className="team-grid">
            {team.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <div className="avatar-initials">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <h4>{member.name}</h4>
                <div className="team-role">{member.role}</div>
                <p className="team-bio">{member.bio}</p>
                <div className="team-social">
                  <FiStar className="social-icon" />
                  <FiStar className="social-icon" />
                  <FiStar className="social-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="timeline-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">OUR JOURNEY</h2>
            <div className="section-line"></div>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-year">{milestone.year}</div>
                <div className="timeline-content">
                  <h4>{milestone.title}</h4>
                  <p>{milestone.desc}</p>
                </div>
                {index < milestones.length - 1 && (
                  <div className="timeline-connector"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-card">
            <h3>READY TO WORK WITH US?</h3>
            <p>
              Join thousands of teams who trust TaskFlow with their most important work. 
              Simple pricing. No contracts. Just great software.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary">
                START FREE TRIAL
              </Link>
              <Link to="/features" className="btn btn-outline">
                VIEW FEATURES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h5>TASKFLOW</h5>
              <p>Brutalist task management for modern teams.</p>
            </div>
            <div className="col-md-2">
              <h6>PRODUCT</h6>
              <ul>
                <li><Link to="/features">Features</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>COMPANY</h6>
              <ul>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6>LEGAL</h6>
              <ul>
                <li><Link to="/privacy">Privacy</Link></li>
                <li><Link to="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 TASKFLOW. BUILT WITH BRUTAL HONESTY.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;