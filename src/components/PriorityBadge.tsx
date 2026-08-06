import React from 'react';
import { TicketPriority } from '../types';
import './PriorityBadge.css';

interface Props {
  priority: TicketPriority;
}

export const PriorityBadge: React.FC<Props> = ({ priority }) => {
  return (
    <span className={`priority-badge priority-${priority.toLowerCase()}`}>
      {priority}
    </span>
  );
};
