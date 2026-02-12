import { useCallback, useEffect, useState } from 'react';
import { fetchFaqQuestions, updateFaqQuestion } from '../services/admin';

const AdminFaq = () => {
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});
  const [filter, setFilter] = useState('all');

  const loadQuestions = useCallback(async (status = filter) => {
    const data = await fetchFaqQuestions(status);
    setQuestions(data);
  }, [filter]);

  useEffect(() => {
    loadQuestions()
      .catch(() => setMessage('Failed to load FAQ questions.'))
      .finally(() => setLoading(false));
  }, [loadQuestions]);

  const updateDraft = (id, field, value) => {
    setDrafts(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async (question) => {
    const draft = drafts[question.id] || {};
    const payload = {
      answer: draft.answer !== undefined ? draft.answer : question.answer || '',
      is_published: draft.is_published !== undefined ? draft.is_published : Boolean(question.is_published),
      status: draft.status !== undefined ? draft.status : question.status || 'open'
    };

    try {
      await updateFaqQuestion(question.id, payload);
      await loadQuestions();
      setMessage('FAQ updated.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update FAQ.';
      setMessage(msg);
    }
  };

  return (
    <div className="admin-content container">
      <div className="admin-header">
        <h1>FAQ Inbox</h1>
        {message && <p className="admin-message">{message}</p>}
      </div>

      <div className="admin-section">
        <div className="admin-faq-filter">
          <label className="admin-control-label" htmlFor="faq-filter">Filter by status</label>
          <select
            id="faq-filter"
            className="form-select admin-faq-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All Questions</option>
            <option value="open">Open</option>
            <option value="answered">Answered</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {loading ? (
          <p className="admin-message">Loading FAQ questions...</p>
        ) : questions.length === 0 ? (
          <div className="admin-faq-empty">
            <p>No FAQ questions yet.</p>
          </div>
        ) : (
          <div className="admin-faq-list">
            {questions.map(question => {
              const draft = drafts[question.id] || {};
              const answerValue = draft.answer !== undefined ? draft.answer : (question.answer || '');
              const isPublished = draft.is_published !== undefined ? draft.is_published : Boolean(question.is_published);
              const statusValue = draft.status !== undefined ? draft.status : (question.status || 'open');
              const createdAt = question.created_at ? new Date(question.created_at).toLocaleString() : 'Unknown';

              return (
                <div key={question.id} className="admin-faq-card">
                  <div className="admin-faq-header">
                    <div className="admin-faq-meta">
                      <span className="faq-from">{question.email || 'Unknown'}</span>
                      <span className="faq-date">{createdAt}</span>
                    </div>
                    <div className="admin-faq-badges">
                      <span className={`admin-pill ${statusValue}`}>{statusValue}</span>
                      <span className={`admin-pill ${isPublished ? 'published' : 'draft'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-faq-question">
                    <strong>Q:</strong> {question.question}
                  </div>

                  <div className="admin-faq-answer-section">
                    <label htmlFor={`answer-${question.id}`} className="admin-control-label">Answer</label>
                    <textarea
                      id={`answer-${question.id}`}
                      className="form-control admin-faq-textarea"
                      rows="3"
                      placeholder="Enter your answer here..."
                      value={answerValue}
                      onChange={(event) => updateDraft(question.id, 'answer', event.target.value)}
                    />
                  </div>

                  <div className="admin-faq-controls">
                    <div className="admin-faq-control-group">
                      <label className="admin-control-label">Status</label>
                      <select
                        className="form-select admin-faq-select"
                        value={statusValue}
                        onChange={(event) => updateDraft(question.id, 'status', event.target.value)}
                      >
                        <option value="open">Open</option>
                        <option value="answered">Answered</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="admin-faq-control-group">
                      <label className="admin-control-label">Publish</label>
                      <select
                        className="form-select admin-faq-select"
                        value={isPublished ? 'yes' : 'no'}
                        onChange={(event) => updateDraft(question.id, 'is_published', event.target.value === 'yes')}
                      >
                        <option value="no">Draft</option>
                        <option value="yes">Published</option>
                      </select>
                    </div>
                    <button className="btn btn-sm btn-dark" onClick={() => handleSave(question)}>
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFaq;
