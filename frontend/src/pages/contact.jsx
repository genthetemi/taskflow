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
  const [fieldErrors, setFieldErrors] = useState({});

  const validators = {
    name: (value) => {
      const cleanValue = String(value || '').trim();
      if (!cleanValue) return 'Name is required.';
      if (cleanValue.length < 2) return 'Name must be at least 2 characters.';
      return '';
    },
    email: (value) => {
      const cleanValue = String(value || '').trim();
      if (!cleanValue) return 'Email is required.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanValue)) return 'Enter a valid email address.';
      return '';
    },
    subject: (value) => {
      const cleanValue = String(value || '').trim();
      if (!cleanValue) return 'Subject is required.';
      if (cleanValue.length < 3) return 'Subject must be at least 3 characters.';
      return '';
    },
    message: (value) => {
      const cleanValue = String(value || '').trim();
      if (!cleanValue) return 'Message is required.';
      if (cleanValue.length < 10) return 'Message must be at least 10 characters.';
      return '';
    }
  };

  const validateField = (name, value) => validators[name]?.(value) || '';

  const validateAll = () => {
    const nextErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message)
    };

    setFieldErrors(nextErrors);
    return Object.values(nextErrors).every((msg) => !msg);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      return;
    }

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
      content: '+383 46 121 768',
      link: 'tel:+38346121768'
    },
    {
      icon: <FiMapPin />,
      title: 'OFFICE',
      content: 'Prishtina, Kosovo',
    }
  ];

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
                  minLength={2}
                  maxLength={80}
                  aria-invalid={Boolean(fieldErrors.name)}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  required
                />
                {fieldErrors.name ? <p className="inline-field-error" id="name-error">{fieldErrors.name}</p> : null}
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
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  required
                />
                {fieldErrors.email ? <p className="inline-field-error" id="email-error">{fieldErrors.email}</p> : null}
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
                  minLength={3}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.subject)}
                  aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                  required
                />
                {fieldErrors.subject ? <p className="inline-field-error" id="subject-error">{fieldErrors.subject}</p> : null}
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
                  minLength={10}
                  maxLength={2000}
                  aria-invalid={Boolean(fieldErrors.message)}
                  aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                  required
                ></textarea>
                {fieldErrors.message ? <p className="inline-field-error" id="message-error">{fieldErrors.message}</p> : null}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={
                  loading ||
                  Object.values(fieldErrors).some(Boolean) ||
                  !formData.name.trim() ||
                  !formData.email.trim() ||
                  !formData.subject.trim() ||
                  !formData.message.trim()
                }
              >
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
