import React from 'react';
import {
  Building,
  Mail,
  IndianRupee,
  IdCard,
  LogOut,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Employee, Manager, UserRole } from '../types.ts';

interface ProfileViewProps {
  role: UserRole;
  profile: Employee | Manager;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  role,
  profile,
  onLogout,
}) => {
  const isEmployee = role === 'EMPLOYEE';
  const employee = isEmployee ? (profile as Employee) : null;
  const manager = !isEmployee ? (profile as Manager) : null;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-16">
      {/* Profile Card Header (Matching reference design) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow">
          {profile.name.charAt(0).toUpperCase()}
        </div>

        <h1 className="text-xl font-bold text-slate-900 leading-tight">
          {profile.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>

        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span>{role}</span>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Employment Information
        </h2>

        {/* Department */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Department</div>
            <div className="text-sm font-semibold text-slate-900">{profile.department}</div>
          </div>
        </div>

        {/* Basic Salary (for employee or manager) */}
        {isEmployee && employee && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">Monthly Basic Salary</div>
              <div className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                ₹{employee.monthly_salary.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500 ml-2">
                  (Annual: ₹{employee.annual_salary.toLocaleString('en-IN')})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Employee ID */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700">
            <IdCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">
              {isEmployee ? 'Employee ID' : 'Manager ID'}
            </div>
            <div className="text-sm font-semibold text-slate-900 font-mono">
              {isEmployee ? employee?.employee_id : manager?.manager_id}
            </div>
          </div>
        </div>

        {/* Sign Out Button (Matching red outline in screenshot) */}
        <div className="pt-4">
          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-400">ExpenseFlow v1.0 · Secure Corporate Session</span>
        </div>
      </div>
    </div>
  );
};
