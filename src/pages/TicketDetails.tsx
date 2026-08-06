import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Ticket, Comment, AuthUser, TicketStatus, AgentInfo } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CommentSection } from '../components/CommentSection';
import { ArrowLeft, Clock, User, UserCheck, Sparkles, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDateTime, formatRelativeTime } from '../utils/dateUtils';
import './TicketDetails.css';

interface Props {
  currentUser: AuthUser | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TicketDetails: React.FC<Props> = ({ currentUser, showToast }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicketDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.ticket);
      setComments(res.data.comments || []);
      setAiSuggestion(res.data.aiSuggestion || null);

      // If Admin, fetch agents list for quick assignment
      if (currentUser?.role === 'ROLE_ADMIN') {
        const dashRes = await api.get('/admin/dashboard');
        setAgents(dashRes.data.agents || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const handleAddComment = async (message: string, updateStatusTo?: TicketStatus) => {
    if (!id) return;
    try {
      setSubmittingComment(true);

      if (currentUser?.role === 'ROLE_AGENT' || currentUser?.role === 'ROLE_ADMIN') {
        const res = await api.post(`/agent/tickets/${id}/reply`, {
          message,
          updateStatusTo,
        });
        showToast('Reply posted successfully!', 'success');
        setComments((prev) => [...prev, res.data.comment]);
        if (res.data.ticket) {
          setTicket(res.data.ticket);
        }
      } else {
        const res = await api.post(`/tickets/${id}/comments`, { message });
        showToast('Reply posted successfully!', 'success');
        setComments((prev) => [...prev, res.data.comment]);
        if (res.data.ticketStatus && ticket) {
          setTicket({ ...ticket, status: res.data.ticketStatus });
        }
      }
    } catch (err: any) {
      showToast('Failed to add reply comment.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!id || !ticket) return;
    try {
      const res = await api.put(`/agent/tickets/${id}/status`, { status: newStatus });
      setTicket(res.data.ticket);
      showToast(`Ticket status changed to ${newStatus}`, 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showToast('Failed to update ticket status', 'error');
    }
  };

  const handleAssignAgent = async (agentId: number) => {
    if (!id) return;
    try {
      const res = await api.put(`/admin/tickets/${id}/assign`, { agentId });
      setTicket(res.data.ticket);
      showToast('Assigned agent updated successfully!', 'success');
      fetchTicketDetails();
    } catch (err: any) {
      showToast('Failed to assign agent', 'error');
    }
  };

  if (loading) {
    return (
      <div className="ticket-details-page">
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
          Loading ticket details...
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-details-page">
        <div className="ticket-error-card">
          <AlertCircle size={28} className="error-icon" />
          <h3>Ticket Not Found</h3>
          <p>{error || 'The requested ticket does not exist or you lack permission to view it.'}</p>
          <button className="back-btn-solid" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-details-page">
      <div className="details-top-bar">
        <button className="back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          <span>Back to Tickets</span>
        </button>
        <span className="details-ticket-id">Ticket ID: #{ticket.id}</span>
      </div>

      <div className="ticket-details-card">
        <div className="ticket-header-row">
          <div className="ticket-title-wrapper">
            <h1 className="ticket-main-title">{ticket.title}</h1>
            <div className="ticket-badge-row">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {(currentUser?.role === 'ROLE_AGENT' || currentUser?.role === 'ROLE_ADMIN') && (
            <div className="agent-status-control">
              <span className="control-label">Change Status:</span>
              <select
                className="status-dropdown-large"
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="ticket-meta-grid">
          <div className="meta-block">
            <User className="meta-icon" size={16} />
            <div>
              <span className="meta-label">Customer Name</span>
              <span className="meta-value">{ticket.customerName} ({ticket.customerEmail})</span>
            </div>
          </div>

          <div className="meta-block">
            <UserCheck className="meta-icon" size={16} />
            <div>
              <span className="meta-label">Assigned Agent</span>
              {currentUser?.role === 'ROLE_ADMIN' ? (
                <select
                  className="assign-select-inline"
                  value={ticket.agentId || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val) handleAssignAgent(val);
                  }}
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="meta-value">
                  {ticket.agentName ? `${ticket.agentName} (${ticket.agentEmail})` : 'Unassigned'}
                </span>
              )}
            </div>
          </div>

          <div className="meta-block">
            <Clock className="meta-icon" size={16} />
            <div>
              <span className="meta-label">Created Date</span>
              <span className="meta-value">{formatDateTime(ticket.createdAt)} ({formatRelativeTime(ticket.createdAt)})</span>
            </div>
          </div>

          <div className="meta-block">
            <RefreshCw className="meta-icon" size={16} />
            <div>
              <span className="meta-label">Last Updated</span>
              <span className="meta-value">{formatDateTime(ticket.updatedAt)} ({formatRelativeTime(ticket.updatedAt)})</span>
            </div>
          </div>
        </div>

        {/* Problem Description Box */}
        <div className="problem-description-box">
          <h3 className="desc-box-title">Problem Description</h3>
          <p className="desc-box-text">{ticket.description}</p>
        </div>

        {/* AI Suggestion Banner if present */}
        {aiSuggestion && (
          <div className="ai-suggestion-banner">
            <div className="banner-title-row">
              <Sparkles size={16} />
              <span>System Automated AI Suggestion</span>
            </div>
            <p className="banner-body">{aiSuggestion}</p>
          </div>
        )}

        {/* Comment / Conversation Thread */}
        <CommentSection
          comments={comments}
          currentUser={currentUser}
          onAddComment={handleAddComment}
          loading={submittingComment}
        />
      </div>
    </div>
  );
};
