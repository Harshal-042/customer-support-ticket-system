import React from 'react';
import { TicketStatus } from '../types';
import './StatusBadge.css';

interface Props {
  status: TicketStatus;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const getLabel = (s: TicketStatus) => {
    switch (s) {
      case 'OPEN':
        return 'OPEN';
      case 'IN_PROGRESS':
        return 'IN PROGRESS';
      case 'RESOLVED':
        return 'RESOLVED';
      case 'CLOSED':
        return 'CLOSED';
      default:
        return s;
    }
  };

  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {getLabel(status)}
    </span>
  );
};
