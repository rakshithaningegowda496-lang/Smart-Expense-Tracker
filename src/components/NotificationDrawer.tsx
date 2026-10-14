import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  Check,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '../types.ts';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onSelectNotificationExpense: (expenseId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectNotificationExpense,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Bell className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">Notifications</h2>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Updates regarding your expense claims will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isApproved = notif.notification_type === 'APPROVED';
              const isRejected = notif.notification_type === 'REJECTED';

              return (
                <div
                  key={notif.notification_id}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    !notif.is_read
                      ? 'bg-sky-50/40 border-sky-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => {
                    if (!notif.is_read) onMarkAsRead(notif.notification_id);
                    if (notif.expense_id) {
                      onSelectNotificationExpense(notif.expense_id);
                      onClose();
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {isApproved && (
                        <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {isRejected && (
                        <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}
                      {!isApproved && !isRejected && (
                        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isApproved
                              ? 'text-emerald-800'
                              : isRejected
                              ? 'text-rose-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {isApproved
                            ? '🔔 Expense Approved'
                            : isRejected
                            ? '🔔 Expense Rejected'
                            : '🔔 Claim Notification'}
                        </span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {new Date(notif.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {notif.expense_id && (
                          <span className="text-sky-600 font-medium flex items-center gap-0.5 hover:underline">
                            <span>View claim</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
