import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Wallet,
  ArrowRight,
  User,
  Building,
  IndianRupee,
  ShieldCheck,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { api, LoginResponse } from '../services/api.ts';

interface LoginProps {
  onLoginSuccess: (data: LoginResponse) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [emailOrId, setEmailOrId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [regDept, setRegDept] = useState('Sales');
  const [regMonthlySalary, setRegMonthlySalary] = useState('30000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim() || !loginPassword.trim()) {
      setError('Please enter your Employee/Manager ID or Email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.login(emailOrId.trim(), loginPassword);
      onLoginSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regDept.trim()) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        department: regDept.trim(),
        monthly_salary: regRole === 'EMPLOYEE' ? parseFloat(regMonthlySalary) || 30000 : undefined,
      });

      setSuccessNotice('Account registered successfully! Signing in...');
      setTimeout(() => {
        onLoginSuccess(res);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const departments = ['Sales', 'Engineering', 'Marketing', 'Finance', 'Operations', 'Human Resources'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* App Logo & Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shadow-md mb-3">
            <Wallet className="w-7 h-7 text-sky-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            ExpenseFlow
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time corporate expense & reimbursement tracking
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          {/* Auth Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'LOGIN'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'REGISTER'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <span className="font-semibold">Notice:</span> {error}
            </div>
          )}

          {successNotice && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              {successNotice}
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email or ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder="you@company.com or EMP001"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-400">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('REGISTER');
                      setError(null);
                    }}
                    className="text-sky-600 hover:underline font-semibold"
                  >
                    Create an account
                  </button>
                </span>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegRole('EMPLOYEE')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer font-medium ${
                      regRole === 'EMPLOYEE'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('MANAGER')}
                    className={`py-2 px-3 rounded-xl border text-center transition cursor-pointer font-medium ${
                      regRole === 'MANAGER'
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Manager
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition text-slate-800"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Salary (If Employee) */}
              {regRole === 'EMPLOYEE' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Base Salary (₹)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={regMonthlySalary}
                      onChange={(e) => setRegMonthlySalary(e.target.value)}
                      placeholder="30000"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition font-mono"
                      required
                    />
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Annual: ₹{(Number(regMonthlySalary) * 12 || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition"
                    required
                    minLength={6}
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PBKDF2-SHA512 Password Encryption & Real-Time Sync</span>
        </div>
      </div>
    </div>
  );
};
