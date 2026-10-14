import {
  Employee,
  EmployeeDashboardSummary,
  Expense,
  Manager,
  ManagerDashboardMetrics,
  NotificationItem,
  User,
} from '../types.ts';

const API_BASE = '/api';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  profile: Employee | Manager;
}

function getStoredToken(): string | null {
  return localStorage.getItem('expenseflow_token');
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Authentication
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'EMPLOYEE' | 'MANAGER';
    department: string;
    monthly_salary?: number;
  }): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || 'Failed to create account');
    }
    if (result.token) {
      localStorage.setItem('expenseflow_token', result.token);
    }
    return result;
  },

  async login(emailOrId: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrId, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to authenticate');
    }
    if (data.token) {
      localStorage.setItem('expenseflow_token', data.token);
    }
    return data;
  },

  async getMe(): Promise<{ user: User; profile: Employee | Manager }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Session expired');
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('expenseflow_token');
    }
  },

  // Employees
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch employees');
    return data.employees;
  },

  async getEmployee(id: string): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch employee');
    return data.employee;
  },

  // Employee Dashboard Summary
  async getEmployeeSummary(employeeId: string, month?: string): Promise<EmployeeDashboardSummary> {
    const url = month
      ? `${API_BASE}/dashboard/employee/${employeeId}?month=${month}`
      : `${API_BASE}/dashboard/employee/${employeeId}`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard summary');
    return data.summary;
  },

  // Manager Dashboard Metrics
  async getManagerMetrics(): Promise<ManagerDashboardMetrics> {
    const res = await fetch(`${API_BASE}/dashboard/manager`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch manager metrics');
    return data.metrics;
  },

  // Expenses
  async getExpenses(params?: {
    employee_id?: string;
    status?: string;
    category?: string;
    month?: string;
  }): Promise<Expense[]> {
    const query = new URLSearchParams();
    if (params?.employee_id) query.append('employee_id', params.employee_id);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    if (params?.month) query.append('month', params.month);

    const res = await fetch(`${API_BASE}/expenses?${query.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch expenses');
    return data.expenses;
  },

  async getExpense(id: string): Promise<Expense> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch expense');
    return data.expense;
  },

  async submitExpense(expenseData: {
    employee_id: string;
    category: string;
    amount: number;
    date: string;
    description: string;
    photo_path?: string;
  }): Promise<{ message: string; expense: Expense }> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(expenseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit expense');
    return data;
  },

  async approveExpense(expenseId: string, managerId: string): Promise<{ message: string; expense: Expense }> {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}/approve`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ manager_id: managerId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve expense');
    return data;
  },

  async rejectExpense(expenseId: string, managerId: string, reason: string): Promise<{ message: string; expense: Expense }> {
    const res = await fetch(`${API_BASE}/expenses/${expenseId}/reject`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ manager_id: managerId, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject expense');
    return data;
  },

  // Notifications
  async getNotifications(employeeId?: string): Promise<{ unreadCount: number; notifications: NotificationItem[] }> {
    const url = employeeId ? `${API_BASE}/notifications?employee_id=${employeeId}` : `${API_BASE}/notifications`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
    return {
      unreadCount: data.unreadCount,
      notifications: data.notifications,
    };
  },

  async markNotificationAsRead(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
  },

  async markAllNotificationsAsRead(employeeId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) throw new Error('Failed to mark notifications as read');
  },

  // System & SQL Schema
  async getSchemaSql(): Promise<string> {
    const res = await fetch(`${API_BASE}/database/schema.sql`);
    return await res.text();
  },
};
