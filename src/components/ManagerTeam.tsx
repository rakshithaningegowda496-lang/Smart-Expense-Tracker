import React from 'react';
import { Users, Mail, Building, IndianRupee, Receipt, ArrowRight } from 'lucide-react';
import { Employee, Expense } from '../types.ts';

interface ManagerTeamProps {
  employees: Employee[];
  expenses: Expense[];
  onSelectEmployeeExpenses: (employeeId: string) => void;
}

export const ManagerTeam: React.FC<ManagerTeamProps> = ({
  employees,
  expenses,
  onSelectEmployeeExpenses,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">My Team</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Employees in your reporting unit, compensation tiers & claim metrics
          </p>
        </div>
        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
          Total Team Members: {employees.length}
        </div>
      </div>

      {/* Team Member Cards (Matching uploaded screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const empExpenses = expenses.filter((e) => e.employee_id === emp.employee_id);
          const pendingCount = empExpenses.filter((e) => e.status === 'PENDING').length;
          const approvedSum = empExpenses
            .filter((e) => e.status === 'APPROVED')
            .reduce((sum, e) => sum + e.amount, 0);

          return (
            <div
              key={emp.employee_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {emp.department} · {emp.email}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      ID: {emp.employee_id}
                    </span>
                  </div>
                </div>

                {/* Salary Metrics */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Monthly Basic Salary:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{emp.monthly_salary.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Annual Salary:</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      ₹{emp.annual_salary.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Expense claims metrics */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                    <span className="text-[11px] text-amber-700 block">Pending Claims</span>
                    <span className="text-base font-bold font-mono text-amber-800 tabular-nums">
                      {pendingCount}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[11px] text-emerald-700 block">Approved MTD</span>
                    <span className="text-base font-bold font-mono text-emerald-800 tabular-nums">
                      ₹{approvedSum.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* View claims button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectEmployeeExpenses(emp.employee_id)}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-slate-500" />
                  <span>Review {emp.name}'s Claims</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
