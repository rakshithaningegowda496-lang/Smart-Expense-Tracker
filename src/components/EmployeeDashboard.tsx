import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Building2,
  BadgePercent,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { Employee, EmployeeDashboardSummary, Expense } from '../types.ts';
import { ExpenseCategoryIcon, ExpenseStatusBadge } from './ExpenseBadge.tsx';

interface EmployeeDashboardProps {
  employee: Employee;
  summary: EmployeeDashboardSummary | null;
  recentExpenses: Expense[];
  onOpenAddExpense: () => void;
  onNavigateToExpenses: () => void;
  onViewExpenseReceipt: (expense: Expense) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employee,
  summary,
  recentExpenses,
  onOpenAddExpense,
  onNavigateToExpenses,
  onViewExpenseReceipt,
}) => {
  const currentMonthName = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const totalSubmitted = summary?.totalSubmittedThisMonth ?? 0;
  const approvedAmt = summary?.approvedExpensesThisMonth ?? 0;
  const pendingAmt = summary?.pendingExpensesThisMonth ?? 0;
  const rejectedAmt = summary?.rejectedExpensesThisMonth ?? 0;
  const remainingSalary = summary?.remainingSalary ?? (employee.monthly_salary - totalSubmitted);
  const totalPayable = summary?.totalPayable ?? (employee.monthly_salary + approvedAmt);

  return (
    <div className="space-y-6 pb-12">
      {/* Employee Greeting & Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {employee.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Hello, {employee.name}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                {employee.employee_id}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Department: {employee.department}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-mono tabular-nums">
                Annual Salary: ₹{employee.annual_salary.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition duration-150 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>+ Add Expense</span>
          </button>
          <button
            onClick={onNavigateToExpenses}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>My Expenses</span>
          </button>
        </div>
      </div>

      {/* Main Financial Highlights: Current Month Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card: Dark Hero Card matching Reference Design */}
        <div className="lg:col-span-1 bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium uppercase tracking-wider">
                Current Month Summary
              </span>
              <span className="text-slate-300 font-medium">{currentMonthName}</span>
            </div>

            <p className="text-xs text-slate-400">Approved Reimbursement</p>
            <div className="text-3xl font-extrabold font-mono text-white mt-1 tabular-nums">
              ₹{approvedAmt.toLocaleString('en-IN')}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Monthly Base Salary</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  ₹{employee.monthly_salary.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Payable This Month</span>
                <span className="font-mono font-bold text-emerald-400 tabular-nums">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-800/60 text-[11px] text-slate-400">
            * Base salary remains secure and is never deducted for expense claims.
          </div>
        </div>

        {/* Right 2 Cols: Monthly Metric Cards as requested in prompt */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            
            {/* Total Submitted */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Submitted</span>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                ₹{totalSubmitted.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">This month</div>
            </div>

            {/* Approved */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                <span>Approved</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                ₹{approvedAmt.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">Ready for payout</div>
            </div>

            {/* Pending */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700 text-xs mb-1">
                <span>Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                ₹{pendingAmt.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-600 mt-1">Awaiting manager</div>
            </div>

            {/* Rejected */}
            <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-700 text-xs mb-1">
                <span>Rejected</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-bold font-mono text-rose-700 tabular-nums">
                ₹{rejectedAmt.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-rose-600 mt-1">Needs review/action</div>
            </div>

          </div>

          {/* Salary vs Monthly Expenses Math Card (Specified in prompt section 2) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Monthly Salary & Expense Balance Breakdown
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Monthly Base Salary</span>
                <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
                  ₹{employee.monthly_salary.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Total Expenses This Month</span>
                <span className="font-mono font-bold text-slate-900 text-base tabular-nums">
                  ₹{totalSubmitted.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="text-xs text-sky-700 font-medium block">
                  Remaining Salary Allowance
                </span>
                <span className="font-mono font-bold text-sky-900 text-base tabular-nums">
                  ₹{remainingSalary.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Expenses List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Expenses</h2>
            <p className="text-xs text-slate-500">Your latest submitted claims and their status</p>
          </div>
          <button
            onClick={onNavigateToExpenses}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No expenses submitted yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click "+ Add Expense" above to record your first claim.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentExpenses.slice(0, 5).map((expense) => (
              <div
                key={expense.expense_id}
                onClick={() => onViewExpenseReceipt(expense)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ExpenseCategoryIcon category={expense.category} className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {expense.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {expense.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                      {expense.description}
                    </p>
                    {expense.status === 'REJECTED' && expense.rejection_reason && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1">
                        Reason: {expense.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                  <ExpenseStatusBadge
                    status={expense.status}
                    rejectionReason={expense.rejection_reason}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
