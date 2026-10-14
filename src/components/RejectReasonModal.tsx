import React, { useState } from 'react';
import { X, AlertTriangle, XCircle } from 'lucide-react';
import { Expense } from '../types.ts';

interface RejectReasonModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (expenseId: string, reason: string) => Promise<void>;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  expense,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific rejection reason for the employee.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onConfirmReject(expense.expense_id, reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reject expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleReasons = [
    'Bill photo is unclear. Please upload a clear receipt.',
    'Receipt is missing or incomplete.',
    'Not a valid business expense under corporate travel policy.',
    'Amount exceeds per-diem policy limit.',
    'Duplicate submission of previous claim.',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-slate-900 text-sm">Reject Expense Claim</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex justify-between font-medium text-slate-700">
              <span>{expense.category} Claim</span>
              <span className="font-mono font-bold text-slate-900">
                ₹{expense.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-slate-500 mt-0.5">
              Employee: {expense.employee_name || expense.employee_id} · {expense.date}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Bill photo is unclear. Please upload a clear receipt."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition text-slate-800"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This reason will be visible to the employee in their expense history and notifications.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Quick Reasons:
            </span>
            <div className="space-y-1">
              {sampleReasons.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setReason(preset)}
                  className="w-full text-left text-[11px] p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition truncate cursor-pointer"
                >
                  • {preset}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Reject Expense</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
