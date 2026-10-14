export type UserRole = 'EMPLOYEE' | 'MANAGER';

export type ExpenseCategory =
  | 'Petrol/Fuel'
  | 'Food'
  | 'Travel'
  | 'Hotel'
  | 'Office Supplies'
  | 'Mobile/Internet'
  | 'Other';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  ref_id: string;
}

export interface Employee {
  employee_id: string;
  name: string;
  email: string;
  department: string;
  monthly_salary: number;
  annual_salary: number;
}

export interface Manager {
  manager_id: string;
  name: string;
  email: string;
  department: string;
}

export interface Expense {
  expense_id: string;
  employee_id: string;
  employee_name?: string;
  employee_dept?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  photo_path: string;
  status: ExpenseStatus;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface NotificationItem {
  notification_id: string;
  employee_id: string;
  expense_id?: string | null;
  message: string;
  notification_type: 'APPROVED' | 'REJECTED' | 'INFO';
  is_read: boolean;
  created_at: string;
}

export interface EmployeeDashboardSummary {
  employee: Employee;
  currentMonth: string;
  monthly_salary: number;
  annual_salary: number;
  totalExpensesThisMonth: number;
  remainingSalary: number;
  approvedExpensesThisMonth: number;
  pendingExpensesThisMonth: number;
  rejectedExpensesThisMonth: number;
  totalSubmittedThisMonth: number;
  totalPayable: number;
  allTime: {
    submitted: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  categoryTotals: Record<string, number>;
}

export interface ManagerDashboardMetrics {
  totalEmployees: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  totalExpensesCount: number;
}
