import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Ticket, AuthUser, AdminStats, AgentInfo } from '../types';
import { TicketTable } from '../components/TicketTable';
import { Shield, Ticket as TicketIcon, Clock, CheckCircle2, AlertCircle, XCircle, Search, Filter } from 'lucide-react';
import './Dashboard.css';

interface Props {
  currentUser: AuthUser | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, showToast }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch Stats & Agents list
      const dashRes = await api.get('/admin/dashboard');
      setStats(dashRes.data.stats);
      setAgents(dashRes.data.agents || []);

      // Fetch All Tickets with filters
      const ticketRes = await api.get('/admin/tickets', {
        params: {
          search: search || undefined,
          status: statusFilter,
          priority: priorityFilter,
          unassigned: unassignedOnly ? 'true' : undefined,
        },
      });
      setTickets(ticketRes.data);
    } catch (err: any) {
      showToast('Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [search, statusFilter, priorityFilter, unassignedOnly]);

  const handleAssignAgent = async (ticketId: number, agentId: number) => {
    try {
      const res = await api.put(`/admin/tickets/${ticketId}/assign`, { agentId });
      const targetAgent = agents.find((a) => a.id === agentId);
      showToast(
        `Ticket #${ticketId} successfully assigned to ${targetAgent ? targetAgent.name : 'Agent'}`,
        'success'
      );
      fetchAdminData();
    } catch (err: any) {
      showToast('Failed to assign ticket', 'error');
    }
  };

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    try {
      await api.put(`/agent/tickets/${ticketId}/status`, { status: newStatus });
      showToast(`Ticket #${ticketId} status updated to ${newStatus}`, 'success');
      fetchAdminData();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <h1>System Administrator Dashboard</h1>
          <p>Global ticket metrics, agent assignments, and overall system statistics</p>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-total">
            <TicketIcon size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-open">
            <AlertCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open Tickets</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-progress">
            <Clock size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.inProgress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-resolved">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.resolved}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-closed">
            <XCircle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>
      </div>

      {/* Agent Workload Overview */}
      {agents.length > 0 && (
        <div className="agent-workload-section" style={{ marginBottom: '24px' }}>
          <h2 className="section-subtitle">Support Agent Allocation Summary</h2>
          <div className="agents-grid">
            {agents.map((agent) => (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-name">{agent.name}</div>
                <div className="agent-card-email">{agent.email}</div>
                <div className="agent-stats-row">
                  <span>Assigned: <strong>{agent.totalAssigned || 0}</strong></span>
                  <span>Active: <strong>{agent.openCount || 0}</strong></span>
                  <span>Resolved: <strong>{agent.resolvedCount || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by ticket title, customer, or ID..."
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

          <div className="filter-item" style={{ cursor: 'pointer' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(e) => setUnassignedOnly(e.target.checked)}
              />
              <span>Unassigned Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading system tickets...
        </div>
      ) : (
        <TicketTable
          tickets={tickets}
          currentUser={currentUser}
          agents={agents}
          onAssignAgent={handleAssignAgent}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
