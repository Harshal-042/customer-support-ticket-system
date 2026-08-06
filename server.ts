import express, { Request, Response } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-student-assessment-2026';
const PORT = 3000;

interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
}

interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  customerId: number;
  customerName: string;
  customerEmail: string;
  agentId: number | null;
  agentName: string | null;
  agentEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

// Helper function to generate today's timestamp at specific hour & minute
function getTodayIso(hours: number, minutes: number): string {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// In-Memory Database for Assessment Demo
const users: User[] = [
  {
    id: 1,
    name: 'Harshal Bachhav',
    email: 'harshal@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'ROLE_CUSTOMER',
  },
  {
    id: 2,
    name: 'Priya Verma',
    email: 'agent@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'ROLE_AGENT',
  },
  {
    id: 3,
    name: 'Amit Kumar',
    email: 'agent2@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'ROLE_AGENT',
  },
  {
    id: 4,
    name: 'Prof. S. K. Gupta',
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('password123', 8),
    role: 'ROLE_ADMIN',
  },
];

let nextUserId = 5;
let nextTicketId = 1006;
let nextCommentId = 12;

const tickets: Ticket[] = [
  {
    id: 1001,
    title: 'Payment gateway transaction failed twice',
    description: 'I tried paying for the premium subscription via UPI/Netbanking. Money was deducted from bank but ticket order status says payment pending.',
    priority: 'HIGH',
    status: 'OPEN',
    customerId: 1,
    customerName: 'Harshal Bachhav',
    customerEmail: 'harshal@example.com',
    agentId: null,
    agentName: null,
    agentEmail: null,
    createdAt: getTodayIso(9, 15),
    updatedAt: getTodayIso(9, 20),
  },
  {
    id: 1002,
    title: 'Unable to reset account password',
    description: 'Forgot password link email is not received in inbox or spam folder. Need help updating my account credential.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    customerId: 1,
    customerName: 'Harshal Bachhav',
    customerEmail: 'harshal@example.com',
    agentId: 2,
    agentName: 'Priya Verma',
    agentEmail: 'agent@example.com',
    createdAt: getTodayIso(11, 40),
    updatedAt: getTodayIso(12, 5),
  },
  {
    id: 1003,
    title: 'GST Invoice receipt generation error',
    description: 'Required tax invoice PDF download gives 404 error on billing section page.',
    priority: 'LOW',
    status: 'RESOLVED',
    customerId: 1,
    customerName: 'Harshal Bachhav',
    customerEmail: 'harshal@example.com',
    agentId: 2,
    agentName: 'Priya Verma',
    agentEmail: 'agent@example.com',
    createdAt: getTodayIso(14, 10),
    updatedAt: getTodayIso(14, 35),
  },
  {
    id: 1004,
    title: 'System slowness during peak hours',
    description: 'Application dashboard response time is slow around 6 PM IST. Please investigate cache or database latency.',
    priority: 'HIGH',
    status: 'CLOSED',
    customerId: 1,
    customerName: 'Harshal Bachhav',
    customerEmail: 'harshal@example.com',
    agentId: 3,
    agentName: 'Amit Kumar',
    agentEmail: 'agent2@example.com',
    createdAt: getTodayIso(16, 25),
    updatedAt: getTodayIso(17, 10),
  },
  {
    id: 1005,
    title: 'Request for account profile data export',
    description: 'Please provide complete JSON/CSV data backup of my historical support queries.',
    priority: 'LOW',
    status: 'OPEN',
    customerId: 1,
    customerName: 'Harshal Bachhav',
    customerEmail: 'harshal@example.com',
    agentId: null,
    agentName: null,
    agentEmail: null,
    createdAt: getTodayIso(19, 15),
    updatedAt: getTodayIso(19, 45),
  },
];

const comments: Comment[] = [
  {
    id: 1,
    ticketId: 1001,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Payment failed but Rs. 499 deducted from Bank account. Transaction Ref #UPI998823.',
    createdAt: getTodayIso(9, 15),
  },
  {
    id: 2,
    ticketId: 1001,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Checking bank portal statement, amount is still debited.',
    createdAt: getTodayIso(9, 20),
  },
  {
    id: 3,
    ticketId: 1002,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'I submitted password reset form 3 times.',
    createdAt: getTodayIso(11, 40),
  },
  {
    id: 4,
    ticketId: 1002,
    userId: 2,
    userName: 'Priya Verma',
    userRole: 'ROLE_AGENT',
    message: 'Please verify if your email provider is blocking automated system emails or check your junk folder.',
    createdAt: getTodayIso(11, 52),
  },
  {
    id: 5,
    ticketId: 1002,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Still not working after checking spam filter.',
    createdAt: getTodayIso(12, 0),
  },
  {
    id: 6,
    ticketId: 1002,
    userId: 2,
    userName: 'Priya Verma',
    userRole: 'ROLE_AGENT',
    message: 'We have manually triggered a secure password reset link to your registered email.',
    createdAt: getTodayIso(12, 5),
  },
  {
    id: 7,
    ticketId: 1003,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Cannot download invoice for order #INV-8871.',
    createdAt: getTodayIso(14, 10),
  },
  {
    id: 8,
    ticketId: 1003,
    userId: 2,
    userName: 'Priya Verma',
    userRole: 'ROLE_AGENT',
    message: 'Invoice PDF generation engine has been fixed and your receipt is now accessible in the Billing portal.',
    createdAt: getTodayIso(14, 35),
  },
  {
    id: 9,
    ticketId: 1004,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Application dashboard response time is slow around peak hours.',
    createdAt: getTodayIso(16, 25),
  },
  {
    id: 10,
    ticketId: 1004,
    userId: 3,
    userName: 'Amit Kumar',
    userRole: 'ROLE_AGENT',
    message: 'Database query indexes optimized and server memory cache cleared. Performance restored.',
    createdAt: getTodayIso(17, 10),
  },
  {
    id: 11,
    ticketId: 1005,
    userId: 1,
    userName: 'Harshal Bachhav',
    userRole: 'ROLE_CUSTOMER',
    message: 'Please provide complete JSON/CSV data backup of my historical support queries.',
    createdAt: getTodayIso(19, 15),
  },
];

// Helper: AI Suggestion Service (Keyword based)
function getAiSuggestion(description: string): string | null {
  const lower = description.toLowerCase();
  if (lower.includes('password') || lower.includes('forgot') || lower.includes('reset')) {
    return 'Please try resetting your password using the Forgot Password option on the login screen or verify your email spam folder.';
  }
  if (lower.includes('payment') || lower.includes('upi') || lower.includes('card') || lower.includes('deducted') || lower.includes('transaction')) {
    return 'Please verify your payment status with your bank reference number. Most failed transactions auto-refund within 24-48 hours.';
  }
  if (lower.includes('invoice') || lower.includes('receipt') || lower.includes('bill') || lower.includes('gst')) {
    return 'Tax invoices are automatically emailed within 15 minutes of payment. You can also view them under Account -> Billing History.';
  }
  if (lower.includes('slow') || lower.includes('loading') || lower.includes('lag') || lower.includes('cache')) {
    return 'Please clear your browser cache and cookies, or try accessing the portal using Google Chrome in Incognito mode.';
  }
  if (lower.includes('login') || lower.includes('auth') || lower.includes('access')) {
    return 'Ensure your caps lock is off and check that your registered email address matches your profile record.';
  }
  return 'Thank you for submitting your ticket. A support agent will review your issue shortly.';
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name: string;
    email: string;
    role: 'ROLE_CUSTOMER' | 'ROLE_AGENT' | 'ROLE_ADMIN';
  };
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired JWT token.' });
  }
}

function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: Function) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient role permissions.' });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- REST API ENDPOINTS ---

  // Auth: Register
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    const userRole = role && ['ROLE_CUSTOMER', 'ROLE_AGENT'].includes(role)
      ? role
      : 'ROLE_CUSTOMER';

    const newUser: User = {
      id: nextUserId++,
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 8),
      role: userRole as any,
    };

    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });

  // AI Suggestion API
  app.post('/api/ai/suggest', (req: Request, res: Response) => {
    const { description } = req.body;
    const suggestion = getAiSuggestion(description || '');
    return res.json({ suggestion });
  });

  // Customer: View Own Tickets (or filtered by status/priority/search)
  app.get('/api/tickets/my', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    let userTickets = tickets.filter((t) => t.customerId === userId || req.user!.role !== 'ROLE_CUSTOMER');

    const { status, priority, search } = req.query;

    if (status && status !== 'ALL') {
      userTickets = userTickets.filter((t) => t.status === status);
    }
    if (priority && priority !== 'ALL') {
      userTickets = userTickets.filter((t) => t.priority === priority);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      userTickets = userTickets.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    userTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(userTickets);
  });

  // Customer: Create Support Ticket
  app.post('/api/tickets', authenticateToken, requireRole('ROLE_CUSTOMER', 'ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const { title, description, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: nextTicketId++,
      title,
      description,
      priority: priority || 'MEDIUM',
      status: 'OPEN',
      customerId: req.user!.id,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
      agentId: null,
      agentName: null,
      agentEmail: null,
      createdAt: now,
      updatedAt: now,
    };

    tickets.unshift(newTicket);

    // Initial comment by customer
    comments.push({
      id: nextCommentId++,
      ticketId: newTicket.id,
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      message: description,
      createdAt: now,
    });

    // Generate AI response suggestion
    const aiSuggestion = getAiSuggestion(description);

    return res.status(201).json({
      message: 'Support Ticket created successfully!',
      ticket: newTicket,
      aiSuggestion,
    });
  });

  // Ticket Details (Customer, Agent, or Admin)
  app.get('/api/tickets/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    // Role check: customer can only view own ticket unless agent or admin
    if (req.user!.role === 'ROLE_CUSTOMER' && ticket.customerId !== req.user!.id) {
      return res.status(403).json({ message: 'Unauthorized access to this ticket.' });
    }

    const ticketComments = comments
      .filter((c) => c.ticketId === ticketId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const aiSuggestion = getAiSuggestion(ticket.description);

    return res.json({
      ticket,
      comments: ticketComments,
      aiSuggestion,
    });
  });

  // Add Comment / Conversation
  app.post('/api/tickets/:id/comments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Comment message cannot be empty.' });
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    if (req.user!.role === 'ROLE_CUSTOMER' && ticket.customerId !== req.user!.id) {
      return res.status(403).json({ message: 'Unauthorized access.' });
    }

    const now = new Date().toISOString();
    const newComment: Comment = {
      id: nextCommentId++,
      ticketId,
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      message: message.trim(),
      createdAt: now,
    };

    comments.push(newComment);
    ticket.updatedAt = now;

    // If customer replied and ticket was RESOLVED, move back to IN_PROGRESS
    if (req.user!.role === 'ROLE_CUSTOMER' && ticket.status === 'RESOLVED') {
      ticket.status = 'IN_PROGRESS';
    }

    return res.status(201).json({
      message: 'Comment added successfully!',
      comment: newComment,
      ticketStatus: ticket.status,
    });
  });

  // Agent: View Assigned Tickets
  app.get('/api/agent/tickets', authenticateToken, requireRole('ROLE_AGENT', 'ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const agentId = req.user!.id;
    let agentTickets = tickets.filter((t) => t.agentId === agentId || req.user!.role === 'ROLE_ADMIN');

    const { status, priority, search } = req.query;

    if (status && status !== 'ALL') {
      agentTickets = agentTickets.filter((t) => t.status === status);
    }
    if (priority && priority !== 'ALL') {
      agentTickets = agentTickets.filter((t) => t.priority === priority);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      agentTickets = agentTickets.filter(
        (t) => t.title.toLowerCase().includes(q) || t.customerName.toLowerCase().includes(q)
      );
    }

    agentTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(agentTickets);
  });

  // Agent: Change Ticket Status
  app.put('/api/agent/tickets/:id/status', authenticateToken, requireRole('ROLE_AGENT', 'ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { status } = req.body;

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();

    // System comment logging status change
    comments.push({
      id: nextCommentId++,
      ticketId,
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      message: `[System Update] Ticket status changed to ${status}`,
      createdAt: ticket.updatedAt,
    });

    return res.json({
      message: `Ticket status updated to ${status} successfully!`,
      ticket,
    });
  });

  // Agent: Reply to Ticket
  app.post('/api/agent/tickets/:id/reply', authenticateToken, requireRole('ROLE_AGENT', 'ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { message, updateStatusTo } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const now = new Date().toISOString();
    const newComment: Comment = {
      id: nextCommentId++,
      ticketId,
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      message: message.trim(),
      createdAt: now,
    };

    comments.push(newComment);

    // Automatically assign to agent if not assigned
    if (!ticket.agentId) {
      ticket.agentId = req.user!.id;
      ticket.agentName = req.user!.name;
      ticket.agentEmail = req.user!.email;
    }

    // Optionally update status
    if (updateStatusTo && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(updateStatusTo)) {
      ticket.status = updateStatusTo;
    } else if (ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS';
    }

    ticket.updatedAt = now;

    return res.status(201).json({
      message: 'Reply sent successfully!',
      comment: newComment,
      ticket,
    });
  });

  // Admin: View All Tickets
  app.get('/api/admin/tickets', authenticateToken, requireRole('ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    let allTickets = [...tickets];
    const { status, priority, search, unassigned } = req.query;

    if (status && status !== 'ALL') {
      allTickets = allTickets.filter((t) => t.status === status);
    }
    if (priority && priority !== 'ALL') {
      allTickets = allTickets.filter((t) => t.priority === priority);
    }
    if (unassigned === 'true') {
      allTickets = allTickets.filter((t) => t.agentId === null);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      allTickets = allTickets.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q) ||
          t.id.toString().includes(q)
      );
    }

    allTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(allTickets);
  });

  // Admin: Assign Ticket to Agent
  app.put('/api/admin/tickets/:id/assign', authenticateToken, requireRole('ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const ticketId = parseInt(req.params.id, 10);
    const { agentId } = req.body;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found.' });
    }

    const agent = users.find((u) => u.id === parseInt(agentId, 10) && u.role === 'ROLE_AGENT');
    if (!agent) {
      return res.status(400).json({ message: 'Target user is not a valid Support Agent.' });
    }

    ticket.agentId = agent.id;
    ticket.agentName = agent.name;
    ticket.agentEmail = agent.email;
    if (ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS';
    }
    ticket.updatedAt = new Date().toISOString();

    comments.push({
      id: nextCommentId++,
      ticketId,
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      message: `[Admin Action] Assigned ticket to Support Agent: ${agent.name}`,
      createdAt: ticket.updatedAt,
    });

    return res.json({
      message: `Ticket successfully assigned to ${agent.name}!`,
      ticket,
    });
  });

  // Admin: Dashboard Statistics & Agents List
  app.get('/api/admin/dashboard', authenticateToken, requireRole('ROLE_ADMIN'), (req: AuthenticatedRequest, res: Response) => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = tickets.filter((t) => t.status === 'CLOSED').length;

    const agentsList = users
      .filter((u) => u.role === 'ROLE_AGENT')
      .map((agent) => {
        const assigned = tickets.filter((t) => t.agentId === agent.id);
        return {
          id: agent.id,
          name: agent.name,
          email: agent.email,
          totalAssigned: assigned.length,
          openCount: assigned.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length,
          resolvedCount: assigned.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
        };
      });

    return res.json({
      stats: {
        total,
        open,
        inProgress,
        resolved,
        closed,
      },
      agents: agentsList,
    });
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log("Server running at http://localhost:3000");
  });
}

startServer();
