import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';
import { useAuth } from '../context/authContext';
import { fetchPublishedFaqs, submitFaqQuestion } from '../services/faq';
import '../styles/faq.css';

const Faq = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const loadFaqs = async () => {
    const data = await fetchPublishedFaqs();
    setFaqs(data);
  };

  useEffect(() => {
    loadFaqs()
      .catch(() => setMessage('Failed to load FAQs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setMessage('Please sign in to submit a question.');
      return;
    }

    const trimmed = question.trim();
    if (!trimmed || trimmed.length < 10) {
      setMessage('Please enter a longer question.');
      return;
    }

    try {
      setSubmitting(true);
      await submitFaqQuestion(trimmed);
      setQuestion('');
      setMessage('Question sent. Our team will review it soon.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to submit question.';
      setMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="faq-page">
      <Navbar />
      <header className="faq-hero">
        <div className="container">
          <p className="faq-eyebrow">Support</p>
          <h1>FAQ & Answers</h1>
          <p className="faq-subtitle">Find clear answers or ask a question. We keep it short and direct.</p>
        </div>
      </header>

      <section className="faq-body">
        <div className="container faq-grid">
          <div className="faq-panel">
            <div className="faq-panel-header">
              <h2>Top answers</h2>
              <span className="faq-count">{faqs.length} published</span>
            </div>
            {loading ? (
              <p className="faq-loading">Loading FAQs...</p>
            ) : (
              <div className="faq-list">
                {faqs.length === 0 && (
                  <p className="faq-empty">No published FAQs yet. Ask a question to get started.</p>
                )}
                {faqs.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`faq-item ${openIndex === index ? 'open' : ''}`}
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="faq-question">{item.question}</span>
                    {openIndex === index && (
                      <span className="faq-answer">{item.answer}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="faq-panel faq-ask">
            <div className="faq-panel-header">
              <h2>Ask a question</h2>
              {!user && (
                <Link to="/login" className="faq-login">
                  Sign in to submit
                </Link>
              )}
            </div>
            {message && <p className="faq-message">{message}</p>}
            <form onSubmit={handleSubmit} className="faq-form">
              <label htmlFor="faq-question">Your question</label>
              <textarea
                id="faq-question"
                rows="5"
                placeholder="What do you want to know about TaskFlow?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                disabled={!user || submitting}
              />
              <button type="submit" className="btn btn-dark" disabled={!user || submitting}>
                {submitting ? 'Sending...' : 'Send question'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faq;
