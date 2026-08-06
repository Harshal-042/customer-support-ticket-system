import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, AuthUser, AgentInfo } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Eye } from 'lucide-react';
import { formatDateShort } from '../utils/dateUtils';
import './TicketTable.css';

interface Props {
  tickets: Ticket[];
  currentUser: AuthUser | null;
  agents?: AgentInfo[];
  onAssignAgent?: (ticketId: number, agentId: number) => void;
  onStatusChange?: (ticketId: number, status: any) => void;
}

export const TicketTable: React.FC<Props> = ({
  tickets,
  currentUser,
  agents = [],
  onAssignAgent,
  onStatusChange,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="empty-table-state">
        <p className="empty-title">No support tickets found</p>
        <p className="empty-subtitle">Try adjusting your search query or filters.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return formatDateShort(dateStr);
  };

  return (
    <div className="ticket-table-wrapper">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Customer</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned Agent</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="ticket-id">#{ticket.id}</td>
              <td className="ticket-title-cell">
                <Link to={`/tickets/${ticket.id}`} className="ticket-title-link">
                  {ticket.title}
                </Link>
                <div className="ticket-desc-preview">{ticket.description}</div>
              </td>
              <td className="customer-cell">
                <div className="customer-name">{ticket.customerName}</div>
                <div className="customer-email">{ticket.customerEmail}</div>
              </td>
              <td>
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td>
                {currentUser?.role === 'ROLE_AGENT' || currentUser?.role === 'ROLE_ADMIN' ? (
                  <select
                    className="status-select-inline"
                    value={ticket.status}
                    onChange={(e) => onStatusChange && onStatusChange(ticket.id, e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                ) : (
                  <StatusBadge status={ticket.status} />
                )}
              </td>
              <td>
                {currentUser?.role === 'ROLE_ADMIN' && onAssignAgent ? (
                  <div className="assign-cell-group">
                    <select
                      className="agent-assign-select"
                      value={ticket.agentId || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (val) onAssignAgent(ticket.id, val);
                      }}
                    >
                      <option value="">-- Unassigned --</option>
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span className={ticket.agentName ? 'agent-assigned' : 'agent-unassigned'}>
                    {ticket.agentName ? ticket.agentName : 'Unassigned'}
                  </span>
                )}
              </td>
              <td className="date-cell">{formatDate(ticket.createdAt)}</td>
              <td>
                <Link to={`/tickets/${ticket.id}`} className="view-details-btn">
                  <Eye size={14} />
                  <span>View</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
