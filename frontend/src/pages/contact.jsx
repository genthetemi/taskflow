import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiTwitter,
  FiLinkedin,
  FiGithub,
  FiSend
} from 'react-icons/fi';
import '../styles/contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Error sending contact form:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <FiMail />,
      title: 'EMAIL',
      content: 'info@taskflow.io',
      link: 'mailto:info@taskflow.io'
    },
    {
      icon: <FiPhone />,
      title: 'PHONE',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567'
    },
    {
      icon: <FiMapPin />,
      title: 'OFFICE',
      content: '123 Work Street, San Francisco, CA 94105'
    }
  ];

  const faqItems = [
    {
      question: 'WHAT IS TASKFLOW?',
      answer: `TaskFlow is a brutalist task management tool designed for teams who value simplicity and clarity. We strip away complexity and focus on what actually matters—getting work done.`
    },
    {
      question: 'HOW MUCH DOES TASKFLOW COST?',
      answer: `Our pricing is transparent and simple. Start free with unlimited tasks, upgrade to Pro for advanced features at $29/month. No hidden fees, no surprise charges.`
    },
    {
      question: 'CAN I IMPORT MY TASKS?',
      answer: `Yes! We support imports from most popular task management tools. Just reach out to our support team and we'll help you migrate your data quickly and safely.`
    },
    {
      question: 'IS MY DATA SECURE?',
      answer: `We take security seriously. All data is encrypted in transit and at rest. We maintain SOC 2 compliance and conduct regular security audits to protect your information.`
    },
    {
      question: 'WHAT ABOUT INTEGRATIONS?',
      answer: `TaskFlow integrates with Slack, Microsoft Teams, GitHub, GitLab, and more. We're always adding new integrations based on user requests.`
    },
    {
      question: 'IS THERE A FREE TRIAL?',
      answer: `Absolutely. Sign up for free and get 14 days of full access to all Pro features. No credit card required.`
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className="contact-container">
      <Navbar />

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              GET IN <span className="highlight">TOUCH</span>
            </h1>
            <p className="hero-sub">
              Have a question? Found a bug? Want to give feedback? We're here to listen.
              Reach out and we'll get back to you faster than you'd expect.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods-section">
        <div className="container">
          <div className="methods-grid">
            {contactMethods.map((method, index) => (
              <div key={index} className="method-card">
                <div className="method-icon">
                  {method.icon}
                </div>
                <h4>{method.title}</h4>
                {method.link ? (
                  <a href={method.link} className="method-content">
                    {method.content}
                  </a>
                ) : (
                  <p className="method-content">{method.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header">
              <h2 className="section-title">SEND US A MESSAGE</h2>
              <div className="section-line"></div>
            </div>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">NAME</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">EMAIL</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">SUBJECT</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">MESSAGE</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind..."
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                <FiSend className="btn-icon" />
                {loading ? 'SENDING...' : 'SEND MESSAGE'}
              </button>

              {error && (
                <div className="error-message">
                  <p>✗ {error}</p>
                </div>
              )}

              {submitted && (
                <div className="success-message">
                  <p>✓ Message sent! We'll be in touch soon.</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="form-header">
            <h2 className="section-title">FREQUENTLY ASKED</h2>
            <div className="section-line"></div>
          </div>

          <div className="faq-grid">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-toggle">{expandedFaq === index ? '−' : '+'}</span>
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section className="social-section">
        <div className="container">
          <div className="social-card">
            <h3>FOLLOW US</h3>
            <p>Stay updated with the latest TaskFlow news and updates</p>
            <div className="social-icons">
              <a href="https://twitter.com/taskflow" className="social-link" title="Twitter">
                <FiTwitter />
              </a>
              <a href="https://linkedin.com/company/taskflow" className="social-link" title="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="https://github.com/taskflow" className="social-link" title="GitHub">
                <FiGithub />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="contact-footer">
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

export default Contact;
