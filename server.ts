import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { db, verifyPassword } from './server/db.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = http.createServer(app);

// Enable CORS for Android / external API clients
app.use(cors());

// Increase JSON limit for receipt uploads (base64 images)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// -------------------------------------------------------------
// Real-Time WebSocket Infrastructure
// -------------------------------------------------------------
interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  role?: 'EMPLOYEE' | 'MANAGER';
  refId?: string;
  isAlive?: boolean;
}

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: AuthenticatedSocket, req) => {
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Client sends auth message: { type: 'AUTH', token: '...' }
  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === 'AUTH' && msg.token) {
        const session = db.getSession(msg.token);
        if (session) {
          ws.userId = session.user_id;
          ws.role = session.role;
          ws.refId = session.ref_id;
          ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', role: session.role, userId: session.user_id }));
        } else {
          ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid or expired session' }));
        }
      }
    } catch (e) {
      // Ignore malformed messages
    }
  });
});

// Ping interval to keep connections alive & detect stale sockets
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws: AuthenticatedSocket) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

// Real-Time Broadcast Helpers
function broadcastToManagers(event: string, payload: any) {
  const msg = JSON.stringify({ type: event, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client: AuthenticatedSocket) => {
    if (client.readyState === WebSocket.OPEN && client.role === 'MANAGER') {
      client.send(msg);
    }
  });
}

function sendToEmployee(employeeId: string, event: string, payload: any) {
  const msg = JSON.stringify({ type: event, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client: AuthenticatedSocket) => {
    if (client.readyState === WebSocket.OPEN && client.refId === employeeId) {
      client.send(msg);
    }
  });
}

function broadcastAll(event: string, payload: any) {
  const msg = JSON.stringify({ type: event, data: payload, timestamp: new Date().toISOString() });
  wss.clients.forEach((client: AuthenticatedSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
export interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: 'EMPLOYEE' | 'MANAGER';
    ref_id: string;
    email: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const session = db.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session has expired or is invalid. Please log in again.' });
  }

  const user = db.findUserById(session.user_id);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists.' });
  }

  req.user = {
    user_id: user.user_id,
    role: user.role,
    ref_id: user.ref_id,
    email: user.email,
  };

  next();
}

// -------------------------------------------------------------
// REST API Routes
// -------------------------------------------------------------

// 1. User Registration (Real sign up for Employees and Managers)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department, monthly_salary } = req.body;

    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ error: 'Name, email, password, role, and department are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (role !== 'EMPLOYEE' && role !== 'MANAGER') {
      return res.status(400).json({ error: 'Role must be either EMPLOYEE or MANAGER.' });
    }

    const { user, profile } = db.registerUser({
      name,
      email,
      password,
      role,
      department,
      monthly_salary: monthly_salary ? parseFloat(monthly_salary) : undefined,
    });

    // Create session token
    const session = db.createSession(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: session.token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        ref_id: user.ref_id,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// 2. Authentication Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email/ID and password are required' });
    }

    const cleanInput = email.trim().toLowerCase();
    
    // Look up user by email or by employee_id / manager_id
    let user = db.findUserByEmail(cleanInput);
    if (!user) {
      const emp = db.getEmployees().find((e) => e.employee_id.toLowerCase() === cleanInput);
      if (emp) {
        user = db.findUserByEmail(emp.email);
      } else {
        const mgr = db.getManagers().find((m) => m.manager_id.toLowerCase() === cleanInput);
        if (mgr) {
          user = db.findUserByEmail(mgr.email);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/ID or password.' });
    }

    // Verify cryptographic password hash
    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email/ID or password.' });
    }

    let profile: any = null;
    if (user.role === 'EMPLOYEE') {
      profile = db.getEmployeeById(user.ref_id);
    } else if (user.role === 'MANAGER') {
      profile = db.getManagerById(user.ref_id);
    }

    const session = db.createSession(user);

    return res.json({
      success: true,
      token: session.token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        ref_id: user.ref_id,
      },
      profile,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// 3. Current User Verification
app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  let profile: any = null;
  if (user.role === 'EMPLOYEE') {
    profile = db.getEmployeeById(user.ref_id);
  } else if (user.role === 'MANAGER') {
    profile = db.getManagerById(user.ref_id);
  }

  res.json({
    success: true,
    user,
    profile,
  });
});

// 4. Logout (Revoke Token)
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    db.destroySession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// 5. Employees API
app.get('/api/employees', authenticateToken, (_req: Request, res: Response) => {
  const employees = db.getEmployees().map((e) => {
    const { password_hash, ...safe } = e;
    return safe;
  });
  res.json({ success: true, employees });
});

app.get('/api/employees/:id', authenticateToken, (req: Request, res: Response) => {
  const emp = db.getEmployeeById(req.params.id);
  if (!emp) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  const { password_hash, ...safe } = emp;
  res.json({ success: true, employee: safe });
});

// 6. Employee Dashboard & Monthly Summary
app.get('/api/dashboard/employee/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const targetId = req.params.id;
  // Non-managers can only access their own dashboard
  if (req.user?.role !== 'MANAGER' && req.user?.ref_id !== targetId) {
    return res.status(403).json({ error: 'Unauthorized to view other employee dashboards' });
  }

  const month = typeof req.query.month === 'string' ? req.query.month : undefined;
  const summary = db.getEmployeeSummary(targetId, month);
  if (!summary) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  res.json({ success: true, summary });
});

// 7. Manager Dashboard Summary
app.get('/api/dashboard/manager', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'MANAGER') {
    return res.status(403).json({ error: 'Manager access required' });
  }
  const metrics = db.getManagerSummary();
  res.json({ success: true, metrics });
});

// 8. Expenses API
app.get('/api/expenses', authenticateToken, (req: AuthRequest, res: Response) => {
  const isManager = req.user?.role === 'MANAGER';
  // If employee, force filter to their own employee_id
  const employee_id = isManager
    ? typeof req.query.employee_id === 'string' ? req.query.employee_id : undefined
    : req.user?.ref_id;

  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const month = typeof req.query.month === 'string' ? req.query.month : undefined;

  const expenses = db.getExpenses({ employee_id, status, category, month });
  res.json({ success: true, expenses });
});

app.get('/api/expenses/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const expense = db.getExpenseById(req.params.id);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  if (req.user?.role !== 'MANAGER' && expense.employee_id !== req.user?.ref_id) {
    return res.status(403).json({ error: 'Unauthorized access to this expense' });
  }
  const emp = db.getEmployeeById(expense.employee_id);
  res.json({
    success: true,
    expense: {
      ...expense,
      employee_name: emp?.name || 'Unknown',
      employee_dept: emp?.department || 'General',
    },
  });
});

app.post('/api/expenses', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, date, description, photo_path } = req.body;
    // Always bind employee_id to the authenticated employee
    const employee_id = req.user?.role === 'EMPLOYEE' ? req.user.ref_id : req.body.employee_id;

    if (!employee_id || !category || !amount || !date || !description) {
      return res.status(400).json({ error: 'Missing required expense fields' });
    }

    const emp = db.getEmployeeById(employee_id);
    if (!emp) {
      return res.status(404).json({ error: 'Invalid employee ID' });
    }

    const created = db.createExpense({
      employee_id,
      category,
      amount: parseFloat(amount),
      date,
      description,
      photo_path,
    });

    const enrichedExpense = {
      ...created,
      employee_name: emp.name,
      employee_dept: emp.department,
    };

    // Real-Time Event: Broadcast to all active managers
    broadcastToManagers('EXPENSE_CREATED', {
      expense: enrichedExpense,
      employee_name: emp.name,
    });

    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully and sent to manager for approval.',
      expense: enrichedExpense,
    });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to record expense' });
  }
});

// 9. Expense Approval (Managers only)
app.patch('/api/expenses/:id/approve', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Only managers can approve expenses' });
    }

    const expenseId = req.params.id;
    const managerId = req.user.ref_id;

    const result = db.approveExpense(expenseId, managerId);
    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const { expense, notification } = result;

    // Real-Time Event: Notify the specific employee immediately
    sendToEmployee(expense.employee_id, 'EXPENSE_APPROVED', {
      expense,
      notification,
    });

    // Also inform other managers so review queues stay in sync
    broadcastToManagers('EXPENSE_STATUS_UPDATED', {
      expense,
    });

    res.json({
      success: true,
      message: 'Expense approved successfully. Real-time notification sent to employee.',
      expense,
    });
  } catch (error: any) {
    console.error('Error approving expense:', error);
    res.status(500).json({ error: 'Failed to approve expense' });
  }
});

// 10. Expense Rejection (Managers only)
app.patch('/api/expenses/:id/reject', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Only managers can reject expenses' });
    }

    const expenseId = req.params.id;
    const managerId = req.user.ref_id;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A specific rejection reason is required' });
    }

    const result = db.rejectExpense(expenseId, managerId, reason);
    if (!result) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const { expense, notification } = result;

    // Real-Time Event: Notify the specific employee immediately
    sendToEmployee(expense.employee_id, 'EXPENSE_REJECTED', {
      expense,
      notification,
    });

    // Also update all managers' review queues
    broadcastToManagers('EXPENSE_STATUS_UPDATED', {
      expense,
    });

    res.json({
      success: true,
      message: 'Expense rejected. Real-time notification sent to employee.',
      expense,
    });
  } catch (error: any) {
    console.error('Error rejecting expense:', error);
    res.status(500).json({ error: 'Failed to reject expense' });
  }
});

// 11. In-App Notifications
app.get('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const employeeId = req.user?.role === 'EMPLOYEE' ? req.user.ref_id : undefined;
  const notifications = db.getNotifications(employeeId);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  res.json({
    success: true,
    unreadCount,
    notifications,
  });
});

app.patch('/api/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const ok = db.markNotificationAsRead(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

app.post('/api/notifications/mark-all-read', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'EMPLOYEE') {
    db.markAllNotificationsAsRead(req.user.ref_id);
  }
  res.json({ success: true, message: 'All notifications marked as read' });
});

// 12. Database Schema Export
app.get('/api/database/schema.sql', (_req: Request, res: Response) => {
  try {
    const schemaPath = path.resolve(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf-8');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send(sql);
    }
    return res.status(404).send('-- schema.sql not found');
  } catch (err: any) {
    return res.status(500).send('-- Error reading schema.sql');
  }
});

// -------------------------------------------------------------
// Frontend Integration (Vite Middleware in Dev / Static in Prod)
// -------------------------------------------------------------
async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[ExpenseFlow Server] Running with Real-Time WebSockets on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('[ExpenseFlow Server] Failed to start:', err);
  process.exit(1);
});
