import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, AuthUser } from '../types';
import { TicketTable } from '../components/TicketTable';
import { UserCheck, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';
import './Dashboard.css';

interface Props {
  currentUser: AuthUser | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AgentDashboard: React.FC<Props> = ({ currentUser, showToast }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agent/tickets', {
        params: {
          search: search || undefined,
          status: statusFilter,
          priority: priorityFilter,
        },
      });
      setTickets(res.data);
    } catch (err: any) {
      showToast('Failed to load assigned tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, [search, statusFilter, priorityFilter]);

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await api.put(`/agent/tickets/${ticketId}/status`, { status: newStatus });
      showToast(`Ticket #${ticketId} status updated to ${newStatus}`, 'success');
      fetchAssignedTickets();
    } catch (err: any) {
      showToast('Failed to update ticket status', 'error');
    }
  };

  const totalAssigned = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Support Agent Workbench</h1>
          <p>Review, reply to, and resolve customer support queries</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-total">
            <UserCheck size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalAssigned}</span>
            <span className="stat-label">Assigned Tickets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-open">
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{openCount}</span>
            <span className="stat-label">New Open Queue</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-progress">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{inProgressCount}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{resolvedCount}</span>
            <span className="stat-label">Resolved / Closed</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search assigned tickets or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={14} />
            <span>Status:</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="filter-item">
            <span>Priority:</span>
            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading assigned support tickets...
        </div>
      ) : (
        <TicketTable
          tickets={tickets}
          currentUser={currentUser}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
