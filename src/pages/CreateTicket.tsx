import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { TicketPriority } from '../types';
import { PlusCircle, Sparkles, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import './CreateTicket.css';

interface Props {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreateTicket: React.FC<Props> = ({ showToast }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [description, setDescription] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Debounced Keyword AI suggestion query
  useEffect(() => {
    if (!description.trim() || description.trim().length < 5) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/ai/suggest', { description });
        setAiSuggestion(res.data.suggestion);
      } catch {
        // Silently ignore AI suggestion fetch failures
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/tickets', {
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      showToast('Support Ticket created successfully!', 'success');
      navigate(`/tickets/${res.data.ticket.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="create-ticket-card">
        <div className="card-top-nav">
          <button type="button" onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <div className="create-ticket-header">
          <div className="header-icon-wrapper">
            <PlusCircle size={26} />
          </div>
          <div className="header-text">
            <h2>Submit a Support Ticket</h2>
            <p>Describe your technical or account issue and our team will resolve it.</p>
          </div>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="ticketTitle">Ticket Subject / Title *</label>
            <input
              id="ticketTitle"
              type="text"
              placeholder="e.g. Payment gateway error during checkout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketPriority">Priority Level</label>
            <select
              id="ticketPriority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="priority-select"
            >
              <option value="LOW">LOW - Minor query or feature request</option>
              <option value="MEDIUM">MEDIUM - Standard system issue</option>
              <option value="HIGH">HIGH - Critical blocking problem</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="ticketDesc">Detailed Problem Description *</label>
            <textarea
              id="ticketDesc"
              rows={5}
              placeholder="Provide exact details (e.g., error codes, account email, steps to reproduce)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* AI Keyword Suggestion Box */}
          {aiSuggestion && (
            <div className="ai-suggestion-box">
              <div className="ai-suggestion-header">
                <Sparkles size={16} className="ai-sparkle-icon" />
                <span className="ai-suggestion-title">Instant AI System Suggestion</span>
              </div>
              <p className="ai-suggestion-body">{aiSuggestion}</p>
              <span className="ai-suggestion-note">
                Does this solve your inquiry? You can still submit the ticket below for agent assistance.
              </span>
            </div>
          )}

          <div className="form-actions-row">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button type="submit" className="submit-ticket-btn" disabled={loading}>
              <Send size={16} />
              <span>{loading ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
