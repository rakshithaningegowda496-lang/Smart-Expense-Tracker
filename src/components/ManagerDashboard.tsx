import React from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  Eye,
  Building,
} from 'lucide-react';
import { Expense, Manager, ManagerDashboardMetrics } from '../types.ts';
import { ExpenseCategoryIcon } from './ExpenseBadge.tsx';

interface ManagerDashboardProps {
  manager: Manager;
  metrics: ManagerDashboardMetrics | null;
  pendingExpenses: Expense[];
  onNavigateToReviews: () => void;
  onNavigateToTeam: () => void;
  onApprove: (expenseId: string) => void;
  onRejectPrompt: (expense: Expense) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  manager,
  metrics,
  pendingExpenses,
  onNavigateToReviews,
  onNavigateToTeam,
  onApprove,
  onRejectPrompt,
  onViewReceipt,
}) => {
  const totalEmployees = metrics?.totalEmployees ?? 3;
  const pendingCount = metrics?.pendingCount ?? pendingExpenses.length;
  const pendingAmount = metrics?.pendingAmount ?? 0;
  const approvedAmount = metrics?.approvedAmount ?? 0;
  const rejectedAmount = metrics?.rejectedAmount ?? 0;
  const approvedCount = metrics?.approvedCount ?? 0;
  const rejectedCount = metrics?.rejectedCount ?? 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Manager Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {manager.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                MANAGER
              </span>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {manager.name}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <Building className="w-3.5 h-3.5" />
              <span>Department: {manager.department}</span>
              <span>·</span>
              <span>ID: {manager.manager_id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onNavigateToTeam}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
          >
            <Users className="w-4 h-4 text-slate-500" />
            <span>My Team ({totalEmployees})</span>
          </button>
          <button
            onClick={onNavigateToReviews}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow cursor-pointer"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Pending Reviews Callout Card (Matching uploaded screenshot) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pending Approvals Queue
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                {pendingCount}
              </span>
              <span className="text-sm text-slate-300">
                claims awaiting your managerial review
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Pending value: ₹{pendingAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={onNavigateToReviews}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-sm self-start sm:self-auto"
          >
            Review Pending Claims Now
          </button>
        </div>
      </div>

      {/* Metric Cards (Specified in prompt section 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Team Size</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {totalEmployees}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct reports in {manager.department}</div>
        </div>

        {/* Pending Expenses */}
        <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 tabular-nums">
            {pendingCount}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono">
            ₹{pendingAmount.toLocaleString('en-IN')} pending
          </div>
        </div>

        {/* Approved Expenses */}
        <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
            <span>Approved Total</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
            ₹{approvedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            {approvedCount} claims approved
          </div>
        </div>

        {/* Rejected Expenses */}
        <div className="bg-rose-50/60 p-5 rounded-2xl border border-rose-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-800 text-xs mb-1">
            <span>Rejected Total</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-900 tabular-nums">
            ₹{rejectedAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-rose-700 mt-1">
            {rejectedCount} claims declined
          </div>
        </div>

      </div>

      {/* Quick Pending Approvals Action Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Pending Approvals Fast-Track</h2>
            <p className="text-xs text-slate-500">Quickly approve or reject submitted employee receipts</p>
          </div>
          <button
            onClick={onNavigateToReviews}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View all reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingExpenses.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">All caught up!</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              There are no pending employee expenses awaiting your approval.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingExpenses.slice(0, 5).map((exp) => (
              <div
                key={exp.expense_id}
                className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 -mx-2 px-2 rounded-xl hover:bg-slate-50/60 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <ExpenseCategoryIcon category={exp.category} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {exp.employee_name || exp.employee_id}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({exp.employee_id})
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-700">{exp.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">{exp.description}</p>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Date: {exp.date} · Claim #{exp.expense_id}
                    </div>
                  </div>
                </div>

                {/* Amount & Direct Approval Buttons */}
                <div className="flex items-center justify-between lg:justify-end gap-3 self-end lg:self-center">
                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewReceipt(exp)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                    <button
                      onClick={() => onRejectPrompt(exp)}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 bg-rose-50 border border-rose-200 rounded-lg transition cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => onApprove(exp.expense_id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
