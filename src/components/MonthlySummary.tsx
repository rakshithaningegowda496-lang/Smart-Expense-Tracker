import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { Employee, EmployeeDashboardSummary } from '../types.ts';
import { ExpenseCategoryIcon } from './ExpenseBadge.tsx';

interface MonthlySummaryProps {
  employee: Employee;
  summary: EmployeeDashboardSummary | null;
  onMonthChange: (month: string) => void;
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  employee,
  summary,
  onMonthChange,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  const handleMonthSelect = (m: string) => {
    setSelectedMonth(m);
    onMonthChange(m);
  };

  const monthlySalary = employee.monthly_salary;
  const annualSalary = employee.annual_salary;
  const approvedAmt = summary?.approvedExpensesThisMonth ?? 0;
  const pendingAmt = summary?.pendingExpensesThisMonth ?? 0;
  const rejectedAmt = summary?.rejectedExpensesThisMonth ?? 0;
  const totalSubmitted = summary?.totalSubmittedThisMonth ?? 0;
  const totalPayable = monthlySalary + approvedAmt;

  const categoryTotals = summary?.categoryTotals || {};
  const categoryEntries = Object.entries(categoryTotals);
  const maxCategoryAmt = Math.max(...categoryEntries.map(([, amt]) => amt), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            Monthly Salary & Expense Summary
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent breakdown of salary entitlement and reimbursed claims
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthSelect(e.target.value)}
            className="text-xs font-semibold py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
          >
            <option value="2026-10">October 2026 (Current)</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>
        </div>
      </div>

      {/* Primary Highlights: Separation of Salary and Expense claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Base Compensation Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Salary Structure
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Guaranteed Fixed Base
              </span>
            </div>

            <div className="space-y-4 mt-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Monthly Base Salary</span>
                <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  ₹{monthlySalary.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Contracted gross compensation
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500 block">Annual Compensation (CTC)</span>
                <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                  ₹{annualSalary.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  ₹{monthlySalary.toLocaleString('en-IN')} × 12 months
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Base salary is never deducted or altered for expense filings.</span>
          </div>
        </div>

        {/* Total Payable & Reimbursement Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Reimbursement Settlement
              </span>
              <span className="text-xs font-medium text-slate-300">
                {selectedMonth === '2026-10' ? 'October 2026' : selectedMonth}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">Total Monthly Payout (Salary + Approved)</p>
            <div className="text-3xl font-extrabold font-mono text-white mt-1 tabular-nums">
              ₹{totalPayable.toLocaleString('en-IN')}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Contracted Monthly Salary:</span>
                <span className="font-mono tabular-nums text-white">
                  ₹{monthlySalary.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>+ Approved Business Expenses:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                  + ₹{approvedAmt.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Pending Claims (Under Review):</span>
                <span className="font-mono tabular-nums">
                  ₹{pendingAmt.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Approved claims will be credited alongside the monthly payroll disbursement.
          </div>
        </div>

      </div>

      {/* Breakdown Cards by Status (October 2026 Example from prompt section 5) */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Submitted Expenses Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 block mb-1">Total Submitted</span>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              ₹{totalSubmitted.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">All claims this month</span>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/80 shadow-sm">
            <span className="text-xs text-emerald-800 block mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approved
            </span>
            <div className="text-xl font-bold font-mono text-emerald-800 tabular-nums">
              ₹{approvedAmt.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">Cleared by manager</span>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 shadow-sm">
            <span className="text-xs text-amber-800 block mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending
            </span>
            <div className="text-xl font-bold font-mono text-amber-800 tabular-nums">
              ₹{pendingAmt.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-amber-600 mt-1 block">Under manager review</span>
          </div>

          <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200/80 shadow-sm">
            <span className="text-xs text-rose-800 block mb-1 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Rejected
            </span>
            <div className="text-xl font-bold font-mono text-rose-800 tabular-nums">
              ₹{rejectedAmt.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-rose-600 mt-1 block">Requires revision</span>
          </div>

        </div>
      </div>

      {/* Category Breakdown visual bar list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-slate-600" />
          <span>Approved Expenses by Category</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Distribution of approved reimbursements for {selectedMonth}
        </p>

        {categoryEntries.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No approved expenses for this month yet.
          </div>
        ) : (
          <div className="space-y-3">
            {categoryEntries.map(([cat, amt]) => {
              const pct = Math.round((amt / (approvedAmt || 1)) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ExpenseCategoryIcon category={cat as any} className="w-3.5 h-3.5 text-slate-500" />
                      {cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{pct}%</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        ₹{amt.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(amt / maxCategoryAmt) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
