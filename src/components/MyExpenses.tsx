import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Search,
  Filter,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseStatus } from '../types.ts';
import { ExpenseCategoryIcon, ExpenseStatusBadge } from './ExpenseBadge.tsx';

interface MyExpensesProps {
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onViewReceipt: (expense: Expense) => void;
}

export const MyExpenses: React.FC<MyExpensesProps> = ({
  expenses,
  onOpenAddExpense,
  onViewReceipt,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ExpenseStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchDate = item.date.includes(q);
      if (!matchDesc && !matchCat && !matchDate) return false;
    }
    return true;
  });

  const categories = Array.from(new Set(expenses.map((e) => e.category)));

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">My Expenses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete history of submitted claims, approvals, and receipts
          </p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition duration-150 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({expenses.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-amber-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Pending ({expenses.filter((e) => e.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'APPROVED'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Approved ({expenses.filter((e) => e.status === 'APPROVED').length})
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === 'REJECTED'
                  ? 'bg-white text-rose-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Rejected ({expenses.filter((e) => e.status === 'REJECTED').length})
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by description, date, or category..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-700"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Expenses Grid / Cards */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No matching expenses found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try clearing your search query or filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => {
            const isRejected = expense.status === 'REJECTED';
            return (
              <div
                key={expense.expense_id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Category, Date & Description */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      <ExpenseCategoryIcon category={expense.category} className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {expense.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {expense.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{expense.description}</p>
                    </div>
                  </div>

                  {/* Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400">Claim Amount</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <ExpenseStatusBadge
                        status={expense.status}
                        rejectionReason={expense.rejection_reason}
                        compact
                      />
                      <button
                        onClick={() => onViewReceipt(expense)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Bill</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* If Rejected: Prominently display Manager's rejection reason */}
                {isRejected && expense.rejection_reason && (
                  <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200/80 flex items-start gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Manager Rejection Reason: </span>
                      <span>"{expense.rejection_reason}"</span>
                    </div>
                  </div>
                )}

                {/* If Approved: display approval note */}
                {expense.status === 'APPROVED' && expense.approved_at && (
                  <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Approved on {new Date(expense.approved_at).toLocaleDateString('en-IN')}
                    </span>
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
