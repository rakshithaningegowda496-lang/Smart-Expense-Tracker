import React from 'react';
import { X, Calendar, User, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Expense } from '../types.ts';
import { ExpenseCategoryIcon, ExpenseStatusBadge } from './ExpenseBadge.tsx';

interface ReceiptModalProps {
  expense: Expense | null;
  onClose: () => void;
  isManager?: boolean;
  onApprove?: (expenseId: string) => void;
  onRejectPrompt?: (expense: Expense) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  expense,
  onClose,
  isManager,
  onApprove,
  onRejectPrompt,
}) => {
  if (!expense) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <ExpenseCategoryIcon category={expense.category} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {expense.category} Receipt
              </h3>
              <p className="text-xs text-slate-500">ID: {expense.expense_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Metadata Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Claim Amount</span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <ExpenseStatusBadge
                  status={expense.status}
                  rejectionReason={expense.rejection_reason}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date: {expense.date}</span>
              </div>
              {expense.employee_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Employee: {expense.employee_name}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-700 pt-1">
              <span className="font-medium text-slate-500">Description: </span>
              {expense.description}
            </div>

            {expense.approved_at && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100">
                Approved by manager {expense.approved_by || ''} on{' '}
                {new Date(expense.approved_at).toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Receipt Image / Document Preview */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-2">
            <div className="text-xs text-slate-400 mb-1 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Receipt Document / Bill</span>
            </div>
            {expense.photo_path ? (
              <img
                src={expense.photo_path}
                alt={`Receipt for ${expense.category}`}
                className="max-h-[380px] w-auto object-contain rounded shadow"
              />
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No receipt photo uploaded
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition cursor-pointer"
          >
            Close
          </button>

          {isManager && expense.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onRejectPrompt?.(expense);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  onApprove?.(expense.expense_id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Expense</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
