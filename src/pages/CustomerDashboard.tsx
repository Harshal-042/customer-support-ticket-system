import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Ticket, AuthUser } from '../types';
import { TicketTable } from '../components/TicketTable';
import { PlusCircle, Search, Filter, Ticket as TicketIcon, CheckCircle2, Clock } from 'lucide-react';
import './Dashboard.css';

interface Props {
  currentUser: AuthUser | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CustomerDashboard: React.FC<Props> = ({ currentUser, showToast }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tickets/my', {
        params: {
          search: search || undefined,
          status: statusFilter,
          priority: priorityFilter,
        },
      });
      setTickets(res.data);
    } catch (err: any) {
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, priorityFilter]);

  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>Customer Helpdesk Dashboard</h1>
          <p>Manage, track, and submit customer service support requests</p>
        </div>

        <Link to="/create-ticket" className="create-ticket-header-btn">
          <PlusCircle size={18} />
          <span>Submit Support Ticket</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-total">
            <TicketIcon size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-open">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{openCount}</span>
            <span className="stat-label">Active / In Progress</span>
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

      {/* Search and Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search tickets by title or keywords..."
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

      {/* Ticket List Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading support tickets...
        </div>
      ) : (
        <TicketTable tickets={tickets} currentUser={currentUser} />
      )}
    </div>
  );
};
