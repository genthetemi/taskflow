// features.jsx - LIGHT BRUTALIST
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { 
  FiColumns, 
  FiTag, 
  FiBarChart2, 
  FiUsers, 
  FiCloud, 
  FiShield,
  FiChevronRight,
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';
import { 
  TbBrandSlack,
  TbBrandGithub,
  TbBrandGoogle,
  TbBrandFigma,
  TbBrandNotion,
  TbApi
} from 'react-icons/tb';
import '../styles/features.css';

const features = [
  { 
    title: 'Kanban Boards', 
    icon: <FiColumns />, 
    text: 'Drag-and-drop workflow visualization with custom columns and real-time updates.',
    color: '#000000'
  },
  { 
    title: 'Smart Tagging', 
    icon: <FiTag />, 
    text: 'Color-coded labels and filters to organize tasks by priority, category, or status.',
    color: '#ff3e3e'
  },
  { 
    title: 'Analytics', 
    icon: <FiBarChart2 />, 
    text: 'Track team productivity with detailed reports, burndown charts, and progress metrics.',
    color: '#3e3eff'
  },
  { 
    title: 'Collaboration', 
    icon: <FiUsers />, 
    text: 'Assign tasks, mention team members, and comment with context to keep everyone aligned.',
    color: '#000000'
  },
  { 
    title: 'Cloud Sync', 
    icon: <FiCloud />, 
    text: 'Access your boards from any device. Real-time sync across desktop, web, and mobile.',
    color: '#ff3e3e'
  },
  { 
    title: 'Security', 
    icon: <FiShield />, 
    text: 'Enterprise-grade encryption, role-based permissions, and compliance standards.',
    color: '#3e3eff'
  }
];

const integrations = [
  { name: 'Slack', icon: <TbBrandSlack /> },
  { name: 'GitHub', icon: <TbBrandGithub /> },
  { name: 'Google', icon: <TbBrandGoogle /> },
  { name: 'Figma', icon: <TbBrandFigma /> },
  { name: 'Notion', icon: <TbBrandNotion /> },
  { name: 'API', icon: <TbApi /> }
];

const Features = () => {
  return (
    <div className="features-simple">
      <Navbar />

      {/* Hero Section */}
      <section className="features-hero simple-hero">
        <div className="container text-center">
          <h1 className="hero-title">
            BRUTALIST <span className="highlight">FEATURES</span>
          </h1>
          <p className="hero-sub">
            No fluff. No filler. Just powerful tools designed for productivity.
            Built for teams that value function over form.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">
              <FiCheck className="me-2" />
              Get Started
            </Link>
            <Link className="btn btn-outline-primary" to="/dashboard">
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-grid">
        <div className="container">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card simple"
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <div className="mt-3">
                <FiChevronRight className="text-dark" size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <section className="integrations">
        <div className="container text-center">
          <h2 className="section-title">Integrations</h2>
          <p className="mb-4" style={{ color: '#666', fontSize: '1.1rem' }}>
            Works seamlessly with your existing tools
          </p>
          <div className="integration-list">
            {integrations.map((integration, idx) => (
              <div key={idx} className="integration">
                <span className="me-2" style={{ fontSize: '1.25rem' }}>
                  {integration.icon}
                </span>
                {integration.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="features-cta">
        <div className="container text-center">
          <h3>Ready to work differently?</h3>
          <p>
            Join thousands of teams using TaskFlow to stay organized and productive.
            Start your free trial today — no credit card required.
          </p>
          <Link className="btn btn-primary" to="/register">
            Start Free Trial
            <FiArrowRight className="ms-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
