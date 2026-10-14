import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Login } from './components/Login.tsx';
import { Navbar } from './components/Navbar.tsx';
import { EmployeeDashboard } from './components/EmployeeDashboard.tsx';
import { MyExpenses } from './components/MyExpenses.tsx';
import { MonthlySummary } from './components/MonthlySummary.tsx';
import { ManagerDashboard } from './components/ManagerDashboard.tsx';
import { ManagerExpenseList } from './components/ManagerExpenseList.tsx';
import { ManagerTeam } from './components/ManagerTeam.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AddExpenseModal } from './components/AddExpenseModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { RejectReasonModal } from './components/RejectReasonModal.tsx';
import { NotificationDrawer } from './components/NotificationDrawer.tsx';
import { ApiDocsModal } from './components/ApiDocsModal.tsx';
import { api, LoginResponse } from './services/api.ts';
import { realtime } from './services/websocket.ts';
import {
  Employee,
  EmployeeDashboardSummary,
  Expense,
  ExpenseCategory,
  Manager,
  ManagerDashboardMetrics,
  NotificationItem,
  User,
} from './types.ts';

const SESSION_KEY = 'expenseflow_session';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Employee | Manager | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  // App data state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [employeeSummary, setEmployeeSummary] = useState<EmployeeDashboardSummary | null>(null);
  const [managerMetrics, setManagerMetrics] = useState<ManagerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedReceiptExpense, setSelectedReceiptExpense] = useState<Expense | null>(null);
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  // Toast / Live status banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'info' | 'success' | 'warn' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'warn' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Session verification & restoration on startup
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('expenseflow_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user, profile } = await api.getMe();
        setCurrentUser(user);
        setUserProfile(profile);
        realtime.connect(token);
      } catch (err) {
        // Token expired or invalid
        localStorage.removeItem('expenseflow_token');
        localStorage.removeItem(SESSION_KEY);
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to realtime socket connection status
    const unsubscribeStatus = realtime.onStatusChange((connected) => {
      setIsRealtimeConnected(connected);
    });

    return () => {
      unsubscribeStatus();
    };
  }, []);

  const handleLoginSuccess = (data: LoginResponse) => {
    setCurrentUser(data.user);
    setUserProfile(data.profile);
    setActiveTab('dashboard');
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    realtime.connect(data.token);
    showToast(`Welcome, ${data.profile.name}! Real-time synchronization active.`, 'success');
  };

  const handleLogout = async () => {
    await api.logout();
    realtime.disconnect();
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem(SESSION_KEY);
    setActiveTab('dashboard');
  };

  // 2. Load app data based on user role
  const loadData = useCallback(async () => {
    if (!currentUser) return;

    try {
      if (currentUser.role === 'EMPLOYEE') {
        const [empExpenses, summary, notifs] = await Promise.all([
          api.getExpenses({ employee_id: currentUser.ref_id }),
          api.getEmployeeSummary(currentUser.ref_id),
          api.getNotifications(currentUser.ref_id),
        ]);
        setExpenses(empExpenses);
        setEmployeeSummary(summary);
        setNotifications(notifs.notifications);
        setUnreadCount(notifs.unreadCount);
      } else if (currentUser.role === 'MANAGER') {
        const [allExpenses, allEmps, metrics, notifs] = await Promise.all([
          api.getExpenses(),
          api.getEmployees(),
          api.getManagerMetrics(),
          api.getNotifications(),
        ]);
        setExpenses(allExpenses);
        setEmployees(allEmps);
        setManagerMetrics(metrics);
        setNotifications(notifs.notifications);
        setUnreadCount(notifs.unreadCount);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 3. Real-Time WebSocket Event Listeners
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = realtime.subscribe((event) => {
      const { type, data } = event;

      // Real-Time Event: New expense submitted by employee
      if (type === 'EXPENSE_CREATED') {
        if (currentUser.role === 'MANAGER') {
          setExpenses((prev) => {
            const exists = prev.some((e) => e.expense_id === data.expense.expense_id);
            if (exists) return prev;
            return [data.expense, ...prev];
          });
          setManagerMetrics((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              pendingCount: prev.pendingCount + 1,
              pendingAmount: prev.pendingAmount + data.expense.amount,
              totalExpensesCount: prev.totalExpensesCount + 1,
            };
          });
          showToast(`🔔 New Claim: ${data.employee_name} submitted ₹${data.expense.amount.toLocaleString('en-IN')} (${data.expense.category})`, 'info');
        }
      }

      // Real-Time Event: Expense approved by manager
      if (type === 'EXPENSE_APPROVED') {
        const updatedExpense = data.expense;
        setExpenses((prev) =>
          prev.map((e) => (e.expense_id === updatedExpense.expense_id ? updatedExpense : e))
        );

        if (currentUser.role === 'EMPLOYEE' && currentUser.ref_id === updatedExpense.employee_id) {
          // Add notification to list
          if (data.notification) {
            setNotifications((prev) => [data.notification, ...prev]);
            setUnreadCount((c) => c + 1);
          }
          // Refresh monthly summary calculation
          api.getEmployeeSummary(currentUser.ref_id).then(setEmployeeSummary);
          showToast(`🎉 Your ${updatedExpense.category} claim of ₹${updatedExpense.amount.toLocaleString('en-IN')} has been APPROVED!`, 'success');
        } else if (currentUser.role === 'MANAGER') {
          api.getManagerMetrics().then(setManagerMetrics);
        }
      }

      // Real-Time Event: Expense rejected by manager
      if (type === 'EXPENSE_REJECTED') {
        const updatedExpense = data.expense;
        setExpenses((prev) =>
          prev.map((e) => (e.expense_id === updatedExpense.expense_id ? updatedExpense : e))
        );

        if (currentUser.role === 'EMPLOYEE' && currentUser.ref_id === updatedExpense.employee_id) {
          if (data.notification) {
            setNotifications((prev) => [data.notification, ...prev]);
            setUnreadCount((c) => c + 1);
          }
          api.getEmployeeSummary(currentUser.ref_id).then(setEmployeeSummary);
          showToast(`⚠️ Your ${updatedExpense.category} claim was REJECTED: "${updatedExpense.rejection_reason}"`, 'warn');
        } else if (currentUser.role === 'MANAGER') {
          api.getManagerMetrics().then(setManagerMetrics);
        }
      }

      // Real-Time Event: General status update broadcast
      if (type === 'EXPENSE_STATUS_UPDATED') {
        const updatedExpense = data.expense;
        setExpenses((prev) =>
          prev.map((e) => (e.expense_id === updatedExpense.expense_id ? updatedExpense : e))
        );
        if (currentUser.role === 'MANAGER') {
          api.getManagerMetrics().then(setManagerMetrics);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  // Submit expense handler
  const handleSubmitExpense = async (data: {
    employee_id: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    photo_path?: string;
  }) => {
    const res = await api.submitExpense(data);
    showToast(res.message, 'success');
    await loadData();
  };

  // Approve expense handler (Manager)
  const handleApproveExpense = async (expenseId: string) => {
    if (!currentUser || currentUser.role !== 'MANAGER') return;
    try {
      const res = await api.approveExpense(expenseId, currentUser.ref_id);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to approve');
    }
  };

  // Reject expense handler (Manager)
  const handleConfirmReject = async (expenseId: string, reason: string) => {
    if (!currentUser || currentUser.role !== 'MANAGER') return;
    try {
      const res = await api.rejectExpense(expenseId, currentUser.ref_id, reason);
      showToast(res.message, 'warn');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to reject');
    }
  };

  // Notifications handlers
  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.notification_id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    await api.markAllNotificationsAsRead(currentUser.ref_id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleSelectNotificationExpense = async (expenseId: string) => {
    try {
      const exp = await api.getExpense(expenseId);
      setSelectedReceiptExpense(exp);
    } catch {
      const exp = expenses.find((e) => e.expense_id === expenseId);
      if (exp) setSelectedReceiptExpense(exp);
    }
  };

  // Loading spinner on initial token auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  // If not logged in, render Login
  if (!currentUser || !userProfile) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const isEmployee = currentUser.role === 'EMPLOYEE';
  const employeeObj = isEmployee ? (userProfile as Employee) : null;
  const managerObj = !isEmployee ? (userProfile as Manager) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar with Real-time indicator */}
      <Navbar
        role={currentUser.role}
        userName={userProfile.name}
        department={userProfile.department}
        unreadCount={unreadCount}
        activeTab={activeTab}
        isRealtimeConnected={isRealtimeConnected}
        onTabChange={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenApiDocs={() => setIsApiDocsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Real-Time Live Notification Toast */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm px-4 py-3 rounded-xl shadow-xl border text-xs flex items-center justify-between gap-3 transition duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/40'
              : toastMessage.type === 'warn'
              ? 'bg-slate-900 text-rose-400 border-rose-500/40'
              : 'bg-slate-900 text-sky-300 border-sky-500/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* EMPLOYEE VIEWS */}
        {isEmployee && employeeObj && (
          <>
            {activeTab === 'dashboard' && (
              <EmployeeDashboard
                employee={employeeObj}
                summary={employeeSummary}
                recentExpenses={expenses}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onNavigateToExpenses={() => setActiveTab('expenses')}
                onViewExpenseReceipt={(exp) => setSelectedReceiptExpense(exp)}
              />
            )}

            {activeTab === 'expenses' && (
              <MyExpenses
                expenses={expenses}
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onViewReceipt={(exp) => setSelectedReceiptExpense(exp)}
              />
            )}

            {activeTab === 'payable' && (
              <MonthlySummary
                employee={employeeObj}
                summary={employeeSummary}
                onMonthChange={(m) => {
                  api.getEmployeeSummary(employeeObj.employee_id, m).then(setEmployeeSummary);
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                role={currentUser.role}
                profile={employeeObj}
                onLogout={handleLogout}
              />
            )}
          </>
        )}

        {/* MANAGER VIEWS */}
        {!isEmployee && managerObj && (
          <>
            {activeTab === 'dashboard' && (
              <ManagerDashboard
                manager={managerObj}
                metrics={managerMetrics}
                pendingExpenses={expenses.filter((e) => e.status === 'PENDING')}
                onNavigateToReviews={() => setActiveTab('review')}
                onNavigateToTeam={() => setActiveTab('team')}
                onApprove={handleApproveExpense}
                onRejectPrompt={(exp) => setRejectingExpense(exp)}
                onViewReceipt={(exp) => setSelectedReceiptExpense(exp)}
              />
            )}

            {activeTab === 'review' && (
              <ManagerExpenseList
                expenses={expenses}
                employees={employees}
                onApprove={handleApproveExpense}
                onRejectPrompt={(exp) => setRejectingExpense(exp)}
                onViewReceipt={(exp) => setSelectedReceiptExpense(exp)}
              />
            )}

            {activeTab === 'team' && (
              <ManagerTeam
                employees={employees}
                expenses={expenses}
                onSelectEmployeeExpenses={(empId) => {
                  setActiveTab('review');
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                role={currentUser.role}
                profile={managerObj}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Add Expense Modal */}
      {isEmployee && employeeObj && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          employeeId={employeeObj.employee_id}
          onSubmit={handleSubmitExpense}
        />
      )}

      {/* Receipt Preview Modal */}
      <ReceiptModal
        expense={selectedReceiptExpense}
        onClose={() => setSelectedReceiptExpense(null)}
        isManager={currentUser.role === 'MANAGER'}
        onApprove={handleApproveExpense}
        onRejectPrompt={(exp) => setRejectingExpense(exp)}
      />

      {/* Manager Reject Reason Modal */}
      <RejectReasonModal
        expense={rejectingExpense}
        isOpen={!!rejectingExpense}
        onClose={() => setRejectingExpense(null)}
        onConfirmReject={handleConfirmReject}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectNotificationExpense={handleSelectNotificationExpense}
      />

      {/* MySQL Schema & Android API Docs Modal */}
      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
        onDatabaseResetSuccess={loadData}
      />
    </div>
  );
}
