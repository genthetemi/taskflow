import React from 'react';
import { Alert, Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';

const formatDateTime = (value) => {
  if (!value) {
    return 'Not set';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not set';
  }

  return parsedDate.toLocaleString();
};

const TaskDetailModal = ({
  show,
  task,
  comments,
  commentValue,
  commentsError,
  isCommentsLoading,
  isSubmittingComment,
  onClose,
  onCommentChange,
  onSubmitComment
}) => {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{task?.title || 'Task details'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {task ? (
          <div className="task-detail-layout">
            <div className="task-detail-summary">
              <div className="task-detail-grid">
                <div>
                  <span className="task-detail-label">Status</span>
                  <p>{task.status || 'Pending'}</p>
                </div>
                <div>
                  <span className="task-detail-label">Priority</span>
                  <Badge bg="dark" className="task-detail-badge">
                    {task.priority || 'Medium'}
                  </Badge>
                </div>
                <div>
                  <span className="task-detail-label">Assignee</span>
                  <p>{task.assignee_email || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="task-detail-label">Due date</span>
                  <p>{formatDateTime(task.due_date)}</p>
                </div>
                <div>
                  <span className="task-detail-label">Created</span>
                  <p>{formatDateTime(task.created_at)}</p>
                </div>
                <div>
                  <span className="task-detail-label">Updated</span>
                  <p>{formatDateTime(task.updated_at)}</p>
                </div>
              </div>

              <div className="task-detail-description-block">
                <span className="task-detail-label">Description</span>
                <p>{task.description || 'No description provided.'}</p>
              </div>
            </div>

            <div className="task-comments-section">
              <div className="task-comments-header">
                <h5>Comments</h5>
                <span>{comments.length}</span>
              </div>

              {commentsError && <Alert variant="danger">{commentsError}</Alert>}

              <div className="task-comments-list">
                {isCommentsLoading ? (
                  <div className="task-comments-loading">
                    <Spinner animation="border" size="sm" />
                    <span>Loading comments...</span>
                  </div>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div key={comment._id} className="task-comment-item">
                      <div className="task-comment-meta">
                        <strong>{comment.authorEmail}</strong>
                        <span>{formatDateTime(comment.createdAt)}</span>
                      </div>
                      <p>{comment.message}</p>
                    </div>
                  ))
                ) : (
                  <Alert variant="light" className="mb-0">
                    No comments yet. Add the first update for this task.
                  </Alert>
                )}
              </div>

              <Form onSubmit={onSubmitComment} className="task-comment-form">
                <Form.Group>
                  <Form.Label>Add Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={commentValue}
                    onChange={(event) => onCommentChange(event.target.value)}
                    placeholder="Write a quick update for this task"
                  />
                </Form.Group>
                <div className="task-comment-actions">
                  <Button variant="secondary" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary" type="submit" disabled={!commentValue.trim() || isSubmittingComment}>
                    {isSubmittingComment ? 'Saving...' : 'Post Comment'}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default TaskDetailModal;