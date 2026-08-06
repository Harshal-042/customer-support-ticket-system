export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  customerId: number;
  customerName: string;
  customerEmail: string;
  agentId: number | null;
  agentName: string | null;
  agentEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
}

export interface AdminStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface AgentInfo {
  id: number;
  name: string;
  email: string;
  totalAssigned?: number;
  openCount?: number;
  resolvedCount?: number;
}
