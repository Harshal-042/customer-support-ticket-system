import React, { useState } from 'react';
import { Comment, AuthUser, TicketStatus } from '../types';
import { Send, User, Shield, CheckCircle } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import './CommentSection.css';

interface Props {
  comments: Comment[];
  currentUser: AuthUser | null;
  onAddComment: (message: string, updateStatusTo?: TicketStatus) => void;
  loading?: boolean;
}

export const CommentSection: React.FC<Props> = ({
  comments,
  currentUser,
  onAddComment,
  loading = false,
}) => {
  const [message, setMessage] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<TicketStatus | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onAddComment(message.trim(), statusUpdate || undefined);
    setMessage('');
    setStatusUpdate('');
  };

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'ROLE_ADMIN':
        return <span className="comment-role-badge badge-admin"><Shield size={11} /> Admin</span>;
      case 'ROLE_AGENT':
        return <span className="comment-role-badge badge-agent"><CheckCircle size={11} /> Support Agent</span>;
      case 'ROLE_CUSTOMER':
        return <span className="comment-role-badge badge-customer">Customer</span>;
      default:
        return <span className="comment-role-badge badge-system">System</span>;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const dt = formatDateTime(dateStr);
      const rel = formatRelativeTime(dateStr);
      return rel && rel !== 'Just now' ? `${dt} (${rel})` : dt;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        Conversation History ({comments.length})
      </h3>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="no-comments-text">No comments yet. Start the conversation below.</p>
        ) : (
          comments.map((comment) => {
            const isSystem = comment.message.startsWith('[System');
            return (
              <div
                key={comment.id}
                className={`comment-bubble-wrapper ${
                  isSystem
                    ? 'comment-system'
                    : comment.userId === currentUser?.id
                    ? 'comment-own'
                    : 'comment-other'
                }`}
              >
                {!isSystem && (
                  <div className="comment-avatar">
                    <User size={16} />
                  </div>
                )}

                <div className="comment-bubble">
                  {!isSystem && (
                    <div className="comment-header">
                      <span className="comment-author">{comment.userName}</span>
                      {getRoleBadge(comment.userRole)}
                      <span className="comment-time">{formatTimestamp(comment.createdAt)}</span>
                    </div>
                  )}

                  <div className="comment-body">{comment.message}</div>

                  {isSystem && (
                    <div className="system-time">{formatTimestamp(comment.createdAt)}</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reply Form */}
      <form onSubmit={handleSubmit} className="add-comment-form">
        <div className="form-header">
          <label htmlFor="commentInput" className="form-label">
            Add Reply / Update
          </label>
          {(currentUser?.role === 'ROLE_AGENT' || currentUser?.role === 'ROLE_ADMIN') && (
            <div className="status-update-option">
              <span className="option-label">Update Ticket Status:</span>
              <select
                className="status-dropdown"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value as TicketStatus)}
              >
                <option value="">Keep Current Status</option>
                <option value="IN_PROGRESS">Set to IN_PROGRESS</option>
                <option value="RESOLVED">Set to RESOLVED</option>
                <option value="CLOSED">Set to CLOSED</option>
              </select>
            </div>
          )}
        </div>

        <textarea
          id="commentInput"
          className="comment-textarea"
          rows={3}
          placeholder="Type your reply message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <div className="form-actions">
          <button type="submit" className="submit-reply-btn" disabled={loading || !message.trim()}>
            <Send size={15} />
            <span>{loading ? 'Submitting...' : 'Post Reply'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
