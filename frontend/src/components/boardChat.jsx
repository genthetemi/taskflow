import React, { useEffect, useRef } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

const formatMessageTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const BoardChat = ({
  isActiveBoard,
  isOpen,
  messages,
  draft,
  loading,
  sending,
  error,
  onToggle,
  onDraftChange,
  onSendMessage
}) => {
  const messagesContainerRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !messagesContainerRef.current) {
      return;
    }

    // Use requestAnimationFrame to ensure scroll happens after render
    const scrollToBottom = () => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    };

    // Small delay to ensure DOM is fully updated
    const timeoutId = setTimeout(scrollToBottom, 0);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isOpen]);

  if (!isActiveBoard) {
    return null;
  }

  return (
    <div className="board-chat-widget">
      {isOpen ? (
        <div className="board-chat-popup">
          <div className="board-chat-header">
            <h3>Live Chat</h3>
            <button className="board-chat-close" onClick={onToggle} aria-label="Close chat">
              ✕
            </button>
          </div>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <div className="board-chat-messages" ref={messagesContainerRef}>
            {loading ? (
              <div className="board-chat-loading">
                <Spinner animation="border" size="sm" />
                <span>Loading chat...</span>
              </div>
            ) : messages.length ? (
              messages.map((message) => (
                <div className="board-chat-message" key={message._id || `${message.userId}-${message.createdAt}`}>
                  <div className="board-chat-meta">
                    <strong>{message.authorEmail}</strong>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                  <p>{message.message}</p>
                </div>
              ))
            ) : (
              <Alert variant="light" className="mb-0">
                No messages yet. Start the conversation.
              </Alert>
            )}
          </div>

          <div ref={bottomRef} />

          <Form className="board-chat-form" onSubmit={onSendMessage}>
            <Form.Control
              as="textarea"
              rows={2}
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Type a message for your board"
            />
            <div className="board-chat-actions">
              <Button type="submit" variant="primary" disabled={sending || !draft.trim()}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </Form>
        </div>
      ) : null}

      <div className="board-chat-fab-wrap">
        <Button className="board-chat-fab" onClick={onToggle} aria-label="Toggle live chat">
          <i className="fas fa-comments" aria-hidden="true"></i>
        </Button>
      </div>
    </div>
  );
};

export default BoardChat;