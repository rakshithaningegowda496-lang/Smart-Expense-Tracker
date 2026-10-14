import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  user_id: string;
  email: string;
  password_hash: string;
  role: 'EMPLOYEE' | 'MANAGER';
  ref_id: string;
  created_at: string;
}

export interface EmployeeRecord {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  monthly_salary: number;
  annual_salary: number;
  password_hash: string;
  created_at: string;
}

export interface ManagerRecord {
  manager_id: string;
  name: string;
  email: string;
  department: string;
  password_hash: string;
  created_at: string;
}

export interface ExpenseRecord {
  expense_id: string;
  employee_id: string;
  category: 'Petrol/Fuel' | 'Food' | 'Travel' | 'Hotel' | 'Office Supplies' | 'Mobile/Internet' | 'Other';
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  photo_path: string; // data URL or path
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface NotificationRecord {
  notification_id: string;
  employee_id: string;
  expense_id?: string | null;
  message: string;
  notification_type: 'APPROVED' | 'REJECTED' | 'INFO';
  is_read: boolean;
  created_at: string;
}

export interface SessionRecord {
  token: string;
  user_id: string;
  role: 'EMPLOYEE' | 'MANAGER';
  ref_id: string;
  created_at: string;
  expires_at: string;
}

export interface DatabaseState {
  users: UserRecord[];
  employees: EmployeeRecord[];
  managers: ManagerRecord[];
  expenses: ExpenseRecord[];
  notifications: NotificationRecord[];
  sessions: SessionRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'expense_flow.json');

// Cryptographic Password Hashing (PBKDF2 with SHA-512 and random salt)
export function hashPassword(plainPassword: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    // Fallback for legacy plain text passwords during migration if any
    return plainPassword === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const testHash = crypto.pbkdf2Sync(plainPassword, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// Clean Real-Time Database Initial State (Zero demo expenses, zero demo notifications)
export function getInitialDatabaseState(): DatabaseState {
  return {
    users: [],
    employees: [],
    managers: [],
    expenses: [],
    notifications: [],
    sessions: [],
  };
}

class Database {
  private state: DatabaseState;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.state = JSON.parse(raw);
        if (!this.state.sessions) {
          this.state.sessions = [];
        }
      } catch {
        this.state = getInitialDatabaseState();
        this.save();
      }
    } else {
      this.state = getInitialDatabaseState();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  public clearAllData() {
    this.state = getInitialDatabaseState();
    this.save();
    return this.state;
  }

  // --- Session Management ---
  public createSession(user: UserRecord): SessionRecord {
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    // 7 days expiration
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const session: SessionRecord = {
      token,
      user_id: user.user_id,
      role: user.role,
      ref_id: user.ref_id,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    // Clean up expired sessions
    this.state.sessions = this.state.sessions.filter(
      (s) => new Date(s.expires_at).getTime() > Date.now()
    );
    this.state.sessions.push(session);
    this.save();
    return session;
  }

  public getSession(token: string): SessionRecord | null {
    if (!token) return null;
    const session = this.state.sessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      this.destroySession(token);
      return null;
    }
    return session;
  }

  public destroySession(token: string): boolean {
    const prevLen = this.state.sessions.length;
    this.state.sessions = this.state.sessions.filter((s) => s.token !== token);
    if (this.state.sessions.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Users & Registration ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.state.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  public findUserById(userId: string): UserRecord | undefined {
    return this.state.users.find((u) => u.user_id === userId);
  }

  public registerUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'EMPLOYEE' | 'MANAGER';
    department: string;
    monthly_salary?: number;
  }): { user: UserRecord; profile: EmployeeRecord | ManagerRecord } {
    const cleanEmail = data.email.trim().toLowerCase();
    if (this.findUserByEmail(cleanEmail)) {
      throw new Error('An account with this email address already exists');
    }

    const password_hash = hashPassword(data.password);
    const userId = `USR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;

    if (data.role === 'EMPLOYEE') {
      const empCount = this.state.employees.length + 1;
      const employeeId = `EMP${String(empCount).padStart(3, '0')}`;
      const monthly_salary = Number(data.monthly_salary) || 30000;
      const annual_salary = monthly_salary * 12;

      const employee: EmployeeRecord = {
        employee_id: employeeId,
        name: data.name.trim(),
        email: cleanEmail,
        department: data.department.trim(),
        monthly_salary,
        annual_salary,
        password_hash,
        created_at: new Date().toISOString(),
      };

      const user: UserRecord = {
        user_id: userId,
        email: cleanEmail,
        password_hash,
        role: 'EMPLOYEE',
        ref_id: employeeId,
        created_at: new Date().toISOString(),
      };

      this.state.employees.push(employee);
      this.state.users.push(user);
      this.save();
      return { user, profile: employee };
    } else {
      const mgrCount = this.state.managers.length + 1;
      const managerId = `MGR${String(mgrCount).padStart(3, '0')}`;

      const manager: ManagerRecord = {
        manager_id: managerId,
        name: data.name.trim(),
        email: cleanEmail,
        department: data.department.trim(),
        password_hash,
        created_at: new Date().toISOString(),
      };

      const user: UserRecord = {
        user_id: userId,
        email: cleanEmail,
        password_hash,
        role: 'MANAGER',
        ref_id: managerId,
        created_at: new Date().toISOString(),
      };

      this.state.managers.push(manager);
      this.state.users.push(user);
      this.save();
      return { user, profile: manager };
    }
  }

  // --- Employees ---
  public getEmployees(): EmployeeRecord[] {
    return [...this.state.employees];
  }

  public getEmployeeById(id: string): EmployeeRecord | undefined {
    return this.state.employees.find((e) => e.employee_id === id);
  }

  // --- Managers ---
  public getManagers(): ManagerRecord[] {
    return [...this.state.managers];
  }

  public getManagerById(id: string): ManagerRecord | undefined {
    return this.state.managers.find((m) => m.manager_id === id);
  }

  // --- Expenses ---
  public getExpenses(filters?: {
    employee_id?: string;
    status?: string;
    category?: string;
    month?: string; // YYYY-MM
  }): (ExpenseRecord & { employee_name?: string; employee_dept?: string })[] {
    let result = [...this.state.expenses];

    if (filters?.employee_id) {
      result = result.filter((e) => e.employee_id === filters.employee_id);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(
        (e) => e.status.toUpperCase() === filters.status?.toUpperCase()
      );
    }
    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter(
        (e) => e.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    if (filters?.month) {
      result = result.filter((e) => e.date.startsWith(filters.month!));
    }

    result.sort(
      (a, b) =>
        new Date(b.date || b.created_at).getTime() -
        new Date(a.date || a.created_at).getTime()
    );

    return result.map((exp) => {
      const emp = this.getEmployeeById(exp.employee_id);
      return {
        ...exp,
        employee_name: emp?.name || 'Unknown',
        employee_dept: emp?.department || 'General',
      };
    });
  }

  public getExpenseById(id: string): ExpenseRecord | undefined {
    return this.state.expenses.find((e) => e.expense_id === id);
  }

  public createExpense(data: {
    employee_id: string;
    category: ExpenseRecord['category'];
    amount: number;
    date: string;
    description: string;
    photo_path?: string;
  }): ExpenseRecord {
    const id = `EXP${Date.now().toString().slice(-6)}`;
    const newExpense: ExpenseRecord = {
      expense_id: id,
      employee_id: data.employee_id,
      category: data.category,
      amount: Number(data.amount),
      date: data.date,
      description: data.description,
      photo_path: data.photo_path || '',
      status: 'PENDING',
      rejection_reason: null,
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
    };

    this.state.expenses.unshift(newExpense);
    this.save();
    return newExpense;
  }

  public approveExpense(expenseId: string, managerId: string): { expense: ExpenseRecord; notification: NotificationRecord } | null {
    const expense = this.state.expenses.find((e) => e.expense_id === expenseId);
    if (!expense) return null;

    expense.status = 'APPROVED';
    expense.approved_by = managerId;
    expense.approved_at = new Date().toISOString();
    expense.rejection_reason = null;

    // Create notification for employee
    const notifId = `NOTIF${Date.now().toString().slice(-6)}`;
    const notif: NotificationRecord = {
      notification_id: notifId,
      employee_id: expense.employee_id,
      expense_id: expense.expense_id,
      message: `Your ${expense.category} expense of ₹${expense.amount.toLocaleString('en-IN')} has been approved by the manager.`,
      notification_type: 'APPROVED',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(notif);

    this.save();
    return { expense, notification: notif };
  }

  public rejectExpense(
    expenseId: string,
    managerId: string,
    reason: string
  ): { expense: ExpenseRecord; notification: NotificationRecord } | null {
    const expense = this.state.expenses.find((e) => e.expense_id === expenseId);
    if (!expense) return null;

    expense.status = 'REJECTED';
    expense.approved_by = managerId;
    expense.approved_at = new Date().toISOString();
    expense.rejection_reason = reason.trim();

    // Create notification for employee
    const notifId = `NOTIF${Date.now().toString().slice(-6)}`;
    const notif: NotificationRecord = {
      notification_id: notifId,
      employee_id: expense.employee_id,
      expense_id: expense.expense_id,
      message: `Your ${expense.category} expense of ₹${expense.amount.toLocaleString('en-IN')} has been rejected. Reason: "${reason.trim()}"`,
      notification_type: 'REJECTED',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    this.state.notifications.unshift(notif);

    this.save();
    return { expense, notification: notif };
  }

  // --- Notifications ---
  public getNotifications(employeeId?: string): NotificationRecord[] {
    let result = [...this.state.notifications];
    if (employeeId) {
      result = result.filter((n) => n.employee_id === employeeId);
    }
    result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return result;
  }

  public markNotificationAsRead(notificationId: string): boolean {
    const notif = this.state.notifications.find(
      (n) => n.notification_id === notificationId
    );
    if (!notif) return false;
    notif.is_read = true;
    this.save();
    return true;
  }

  public markAllNotificationsAsRead(employeeId: string): void {
    this.state.notifications.forEach((n) => {
      if (n.employee_id === employeeId) {
        n.is_read = true;
      }
    });
    this.save();
  }

  // --- Financial Summaries ---
  public getEmployeeSummary(employeeId: string, targetYearMonth?: string) {
    const employee = this.getEmployeeById(employeeId);
    if (!employee) return null;

    const ym = targetYearMonth || new Date().toISOString().slice(0, 7);

    const empExpenses = this.state.expenses.filter(
      (e) => e.employee_id === employeeId
    );
    const monthExpenses = empExpenses.filter((e) => e.date.startsWith(ym));

    const totalSubmittedThisMonth = monthExpenses.reduce(
      (acc, cur) => acc + cur.amount,
      0
    );
    const approvedThisMonth = monthExpenses
      .filter((e) => e.status === 'APPROVED')
      .reduce((acc, cur) => acc + cur.amount, 0);
    const pendingThisMonth = monthExpenses
      .filter((e) => e.status === 'PENDING')
      .reduce((acc, cur) => acc + cur.amount, 0);
    const rejectedThisMonth = monthExpenses
      .filter((e) => e.status === 'REJECTED')
      .reduce((acc, cur) => acc + cur.amount, 0);

    const remainingSalary = employee.monthly_salary - totalSubmittedThisMonth;

    const allTimeSubmitted = empExpenses.reduce((acc, cur) => acc + cur.amount, 0);
    const allTimeApproved = empExpenses
      .filter((e) => e.status === 'APPROVED')
      .reduce((acc, cur) => acc + cur.amount, 0);
    const allTimePending = empExpenses
      .filter((e) => e.status === 'PENDING')
      .reduce((acc, cur) => acc + cur.amount, 0);
    const allTimeRejected = empExpenses
      .filter((e) => e.status === 'REJECTED')
      .reduce((acc, cur) => acc + cur.amount, 0);

    const categoryTotals: Record<string, number> = {};
    monthExpenses
      .filter((e) => e.status === 'APPROVED')
      .forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    return {
      employee: {
        employee_id: employee.employee_id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        monthly_salary: employee.monthly_salary,
        annual_salary: employee.annual_salary,
      },
      currentMonth: ym,
      monthly_salary: employee.monthly_salary,
      annual_salary: employee.annual_salary,
      totalExpensesThisMonth: totalSubmittedThisMonth,
      remainingSalary: remainingSalary,
      approvedExpensesThisMonth: approvedThisMonth,
      pendingExpensesThisMonth: pendingThisMonth,
      rejectedExpensesThisMonth: rejectedThisMonth,
      totalSubmittedThisMonth,
      totalPayable: employee.monthly_salary + approvedThisMonth,
      allTime: {
        submitted: allTimeSubmitted,
        approved: allTimeApproved,
        pending: allTimePending,
        rejected: allTimeRejected,
      },
      categoryTotals,
    };
  }

  public getManagerSummary() {
    const totalEmployees = this.state.employees.length;
    const allExpenses = this.state.expenses;

    const pendingExpenses = allExpenses.filter((e) => e.status === 'PENDING');
    const approvedExpenses = allExpenses.filter((e) => e.status === 'APPROVED');
    const rejectedExpenses = allExpenses.filter((e) => e.status === 'REJECTED');

    const pendingAmount = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
    const approvedAmount = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const rejectedAmount = rejectedExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalEmployees,
      pendingCount: pendingExpenses.length,
      pendingAmount,
      approvedCount: approvedExpenses.length,
      approvedAmount,
      rejectedCount: rejectedExpenses.length,
      rejectedAmount,
      totalExpensesCount: allExpenses.length,
    };
  }
}

export const db = new Database();
