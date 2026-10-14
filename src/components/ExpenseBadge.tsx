import React from 'react';
import {
  Fuel,
  Utensils,
  Plane,
  Building,
  Package,
  Wifi,
  Receipt,
} from 'lucide-react';
import { ExpenseCategory, ExpenseStatus } from '../types.ts';

interface CategoryIconProps {
  category: ExpenseCategory;
  className?: string;
}

export const ExpenseCategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  className = 'w-4 h-4',
}) => {
  switch (category) {
    case 'Petrol/Fuel':
      return <Fuel className={className} />;
    case 'Food':
      return <Utensils className={className} />;
    case 'Travel':
      return <Plane className={className} />;
    case 'Hotel':
      return <Building className={className} />;
    case 'Office Supplies':
      return <Package className={className} />;
    case 'Mobile/Internet':
      return <Wifi className={className} />;
    default:
      return <Receipt className={className} />;
  }
};

interface StatusBadgeProps {
  status: ExpenseStatus;
  rejectionReason?: string | null;
  compact?: boolean;
}

export const ExpenseStatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  rejectionReason,
  compact = false,
}) => {
  if (status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Approved
      </span>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Rejected
        </span>
        {!compact && rejectionReason && (
          <p className="text-[11px] text-rose-600 bg-rose-50/60 rounded px-2 py-1 border border-rose-100 max-w-xs">
            <span className="font-semibold">Reason:</span> {rejectionReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      Pending
    </span>
  );
};
