import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Search,
  Calendar,
  User,
  Clock,
  FileText,
  AlertCircle,
  ArrowUpDown,
} from 'lucide-react';
import { Employee, Expense, ExpenseCategory, ExpenseStatus } from '../types.ts';
import { ExpenseCategoryIcon, ExpenseStatusBadge } from './ExpenseBadge.tsx';

interface ManagerExpenseListProps {
  expenses: Expense[];
  employees: Employee[];
  onApprove: (expenseId: string) => void;
  onRejectPrompt: (expense: Expense) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ManagerExpenseList: React.FC<ManagerExpenseListProps> = ({
  expenses,
  employees,
  onApprove,
  onRejectPrompt,
  onViewReceipt,
}) => {
  // Requirement 11: DEFAULT view should show PENDING expenses
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredExpenses = expenses.filter((exp) => {
    if (statusFilter !== 'ALL' && exp.status !== statusFilter) return false;
    if (selectedEmployee !== 'ALL' && exp.employee_id !== selectedEmployee) return false;
    if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) return false;
    if (dateFilter && exp.date !== dateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmp = (exp.employee_name || '').toLowerCase().includes(q) || exp.employee_id.toLowerCase().includes(q);
      const matchDesc = exp.description.toLowerCase().includes(q);
      const matchCat = exp.category.toLowerCase().includes(q);
      if (!matchEmp && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const categories: ExpenseCategory[] = [
    'Petrol/Fuel',
    'Food',
    'Travel',
    'Hotel',
    'Office Supplies',
    'Mobile/Internet',
    'Other',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Team Review · Employee Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and approve receipts submitted by team members across departments
          </p>
        </div>

        {/* Quick summary badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{expenses.filter((e) => e.status === 'PENDING').length} Pending Approval</span>
          </span>
        </div>
      </div>

      {/* Filter Toolbar (Section 11: Pending default, Employee, Category, Date) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Row 1: Status Segmented Control */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Pending ({expenses.filter((e) => e.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'APPROVED'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Approved ({expenses.filter((e) => e.status === 'APPROVED').length})
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-white text-rose-800 shadow-xs'
                  : 'text-slate-600 hover:text-rose-800'
              }`}
            >
              Rejected ({expenses.filter((e) => e.status === 'REJECTED').length})
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({expenses.length})
            </button>
          </div>

          {/* Reset Filters */}
          {(selectedEmployee !== 'ALL' || selectedCategory !== 'ALL' || dateFilter || searchQuery) && (
            <button
              onClick={() => {
                setSelectedEmployee('ALL');
                setSelectedCategory('ALL');
                setDateFilter('');
                setSearchQuery('');
              }}
              className="text-xs text-sky-600 hover:text-sky-700 underline font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Row 2: Secondary Filters (Employee, Category, Date, Search) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Employee Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700 font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filter by Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
              />
            </div>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Keyword
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search note or name..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Expense List Cards / Table */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No expenses found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {statusFilter === 'PENDING'
              ? 'No pending claims requiring review right now.'
              : 'Try adjusting your filters or date range.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((exp) => {
            const isPending = exp.status === 'PENDING';
            const isRejected = exp.status === 'REJECTED';
            const isApproved = exp.status === 'APPROVED';

            return (
              <div
                key={exp.expense_id}
                className={`bg-white rounded-2xl border shadow-sm p-4 sm:p-5 transition ${
                  isPending
                    ? 'border-amber-200/80 hover:border-amber-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Employee info & Claim details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      <ExpenseCategoryIcon category={exp.category} className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {exp.employee_name || exp.employee_id}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {exp.employee_id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {exp.category}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 font-mono">
                          {exp.date}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">{exp.description}</p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                        <span>Claim ID: {exp.expense_id}</span>
                        {exp.employee_dept && <span>Dept: {exp.employee_dept}</span>}
                        {exp.approved_at && (
                          <span className="text-emerald-700">
                            Approved on {new Date(exp.approved_at).toLocaleDateString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Action Buttons (Approve / Reject / View Receipt) */}
                  <div className="flex items-center justify-between lg:justify-end gap-3.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                        ₹{exp.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="mt-0.5">
                        <ExpenseStatusBadge
                          status={exp.status}
                          rejectionReason={exp.rejection_reason}
                          compact
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View Receipt Button */}
                      <button
                        type="button"
                        onClick={() => onViewReceipt(exp)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
                        title="Inspect receipt bill photo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Receipt</span>
                      </button>

                      {/* Approval / Rejection Controls when PENDING */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() => onRejectPrompt(exp)}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onApprove(exp.expense_id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Inline Rejection Reason Display if REJECTED */}
                {isRejected && exp.rejection_reason && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Rejection Reason: </span>
                      <span>"{exp.rejection_reason}"</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
