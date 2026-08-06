import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Clock, User, MessageSquare } from 'lucide-react';
import { formatDateShort } from '../utils/dateUtils';
import './TicketCard.css';

interface Props {
  ticket: Ticket;
}

export const TicketCard: React.FC<Props> = ({ ticket }) => {
  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <span className="ticket-card-id">#{ticket.id}</span>
        <div className="ticket-card-badges">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <h3 className="ticket-card-title">
        <Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link>
      </h3>

      <p className="ticket-card-description">{ticket.description}</p>

      <div className="ticket-card-footer">
        <div className="ticket-card-meta">
          <span className="meta-item">
            <User size={14} />
            <span>{ticket.customerName}</span>
          </span>
          <span className="meta-item">
            <Clock size={14} />
            <span>{formatDateShort(ticket.createdAt)}</span>
          </span>
        </div>

        <Link to={`/tickets/${ticket.id}`} className="ticket-card-action">
          <MessageSquare size={14} />
          <span>View Ticket</span>
        </Link>
      </div>
    </div>
  );
};
