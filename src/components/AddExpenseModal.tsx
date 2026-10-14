import React, { useState } from 'react';
import {
  X,
  Upload,
  Calendar,
  IndianRupee,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { ExpenseCategory } from '../types.ts';
import { ExpenseCategoryIcon } from './ExpenseBadge.tsx';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSubmit: (data: {
    employee_id: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description: string;
    photo_path?: string;
  }) => Promise<void>;
}

const CATEGORIES: ExpenseCategory[] = [
  'Petrol/Fuel',
  'Food',
  'Travel',
  'Hotel',
  'Office Supplies',
  'Mobile/Internet',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  onSubmit,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('Petrol/Fuel');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [description, setDescription] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage('File size exceeds 8MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDemoBill = () => {
    const amt = parseFloat(amount) || 850;
    const vendorMap: Record<ExpenseCategory, string> = {
      'Petrol/Fuel': 'Indian Oil Corp Ltd',
      'Food': 'Spice Route Bistro & Cafe',
      'Travel': 'Uber Rides Mobility',
      'Hotel': 'The Grand Hyatt Business Hotel',
      'Office Supplies': 'Staples Enterprise Stationery',
      'Mobile/Internet': 'Airtel Corporate Broadband',
      'Other': 'Corporate Services Desk',
    };
    const vendor = vendorMap[category] || 'Corporate Merchant';
    const recId = Math.floor(100000 + Math.random() * 900000);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="520" viewBox="0 0 400 520">
      <rect width="400" height="520" fill="#f8fafc"/>
      <rect x="20" y="20" width="360" height="480" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="2"/>
      <line x1="30" y1="40" x2="370" y2="40" stroke="#0284c7" stroke-width="3"/>
      <text x="200" y="75" font-family="monospace" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="middle">${vendor.toUpperCase()}</text>
      <text x="200" y="98" font-family="sans-serif" font-size="12" fill="#64748b" text-anchor="middle">OFFICIAL BUSINESS RECEIPT</text>
      <text x="200" y="118" font-family="monospace" font-size="11" fill="#94a3b8" text-anchor="middle">INVOICE: #INV-${recId}</text>
      <line x1="40" y1="135" x2="360" y2="135" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4"/>
      <text x="40" y="165" font-family="sans-serif" font-size="13" fill="#64748b">Date:</text>
      <text x="360" y="165" font-family="monospace" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="end">${date}</text>
      <text x="40" y="195" font-family="sans-serif" font-size="13" fill="#64748b">Category:</text>
      <text x="360" y="195" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0284c7" text-anchor="end">${category}</text>
      <line x1="40" y1="220" x2="360" y2="220" stroke="#e2e8f0" stroke-width="1"/>
      <text x="40" y="250" font-family="sans-serif" font-size="13" fill="#334155" font-weight="bold">Claim Details</text>
      <text x="360" y="250" font-family="sans-serif" font-size="13" fill="#334155" font-weight="bold" text-anchor="end">Amount</text>
      <text x="40" y="280" font-family="sans-serif" font-size="13" fill="#475569">${description || category + ' expense'}</text>
      <text x="360" y="280" font-family="monospace" font-size="14" fill="#0f172a" text-anchor="end">₹${amt.toFixed(2)}</text>
      <line x1="40" y1="345" x2="360" y2="345" stroke="#0f172a" stroke-width="1.5"/>
      <text x="40" y="380" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0f172a">TOTAL CHARGED</text>
      <text x="360" y="380" font-family="monospace" font-size="20" font-weight="bold" fill="#0f172a" text-anchor="end">₹${amt.toFixed(2)}</text>
      <rect x="40" y="410" width="320" height="50" rx="4" fill="#f1f5f9"/>
      <text x="200" y="435" font-family="monospace" font-size="11" fill="#0284c7" font-weight="bold" text-anchor="middle">VERIFIED ORIGINAL BILL VOUCHER</text>
    </svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setPhotoPreview(dataUri);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid expense amount greater than 0');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please enter a brief description for this expense');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Auto-generate voucher if none uploaded
      let receiptData = photoPreview;
      if (!receiptData) {
        generateDemoBill();
      }

      await onSubmit({
        employee_id: employeeId,
        category,
        amount: parsedAmount,
        date,
        description: description.trim(),
        photo_path: photoPreview || undefined,
      });

      setSuccessMessage('Expense submitted successfully and sent to manager for approval.');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
        // Reset form
        setAmount('');
        setDescription('');
        setPhotoPreview(null);
      }, 1400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Submit New Expense</h2>
            <p className="text-xs text-slate-500">
              Submit business expense claim for manager approval
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {successMessage && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <span className="font-semibold">Notice:</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expense Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition text-left cursor-pointer ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/80 text-sky-900 font-semibold ring-1 ring-sky-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <ExpenseCategoryIcon
                        category={cat}
                        className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount & Date in 2 cols */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="850"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition font-mono tabular-nums"
                    required
                  />
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Purpose
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Travel to client office for product demonstration"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                  required
                />
              </div>
            </div>

            {/* Bill / Photo Upload */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Expense Photo / Bill Upload
                </label>
                <button
                  type="button"
                  onClick={generateDemoBill}
                  className="text-[11px] text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate Test Receipt</span>
                </button>
              </div>

              {photoPreview ? (
                <div className="relative border border-slate-200 rounded-xl p-2 bg-slate-50 flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="Receipt preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">Receipt Attached</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      Ready to submit with claim
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition text-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    Choose Photo / Receipt
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG, or PDF up to 8MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !!successMessage}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Submit Expense</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
