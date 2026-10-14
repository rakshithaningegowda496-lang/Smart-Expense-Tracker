import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Smartphone,
  Copy,
  Check,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatabaseResetSuccess: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({
  isOpen,
  onClose,
  onDatabaseResetSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'sql' | 'realtime' | 'android'>('realtime');
  const [sqlContent, setSqlContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSchemaSql().then((sql) => setSqlContent(sql)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/auth/register',
      desc: 'Creates a new Employee or Manager account with encrypted password (PBKDF2-SHA512)',
      body: '{\n  "name": "Alex Mercer",\n  "email": "alex@company.com",\n  "password": "SecurePassword123",\n  "role": "EMPLOYEE",\n  "department": "Engineering",\n  "monthly_salary": 45000\n}',
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      desc: 'Authenticates employee/manager and returns Bearer token session & profile',
      body: '{\n  "email": "alex@company.com",\n  "password": "SecurePassword123"\n}',
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      desc: 'Verifies active Bearer session token and returns logged-in user profile',
    },
    {
      method: 'GET',
      path: '/api/dashboard/employee/{employee_id}',
      desc: 'Retrieves employee monthly salary, submitted expenses, and remaining salary allowance',
    },
    {
      method: 'POST',
      path: '/api/expenses',
      desc: 'Submits a new claim (triggers real-time EXPENSE_CREATED event to all managers)',
      body: '{\n  "category": "Petrol/Fuel",\n  "amount": 850,\n  "date": "2026-10-14",\n  "description": "Travel to regional client",\n  "photo_path": "data:image/png;base64,..."\n}',
    },
    {
      method: 'PATCH',
      path: '/api/expenses/{id}/approve',
      desc: 'Manager approves claim (triggers real-time EXPENSE_APPROVED event to employee)',
    },
    {
      method: 'PATCH',
      path: '/api/expenses/{id}/reject',
      desc: 'Manager rejects claim with reason (triggers real-time EXPENSE_REJECTED event to employee)',
      body: '{\n  "reason": "Receipt bill is unreadable. Please upload a clear photo."\n}',
    },
  ];

  const realtimeEvents = [
    {
      event: 'EXPENSE_CREATED',
      target: 'Connected Managers',
      desc: 'Dispatched immediately when an employee files a claim. Updates managers’ live queues and pending counts without refreshing.',
    },
    {
      event: 'EXPENSE_APPROVED',
      target: 'Claimant Employee & Managers',
      desc: 'Dispatched when a manager approves a claim. Employee receives instant approval toast, status badge updates, and notification bell increment.',
    },
    {
      event: 'EXPENSE_REJECTED',
      target: 'Claimant Employee & Managers',
      desc: 'Dispatched with the manager’s rejection reason. Employee is notified in real time with the reason highlighted in their history.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Zap className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base leading-tight">
                Real-Time Architecture & Android API
              </h2>
              <p className="text-xs text-slate-500">
                Production WebSocket events, PBKDF2 authentication, and MySQL 8.0 schema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'realtime'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>WebSocket Events</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'android'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>REST API Endpoints</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>MySQL Schema (schema.sql)</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'realtime' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-wider text-sky-400">
                    WebSocket Protocol: ws://host/ws
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time synchronization keeps Employees and Managers completely in sync.
                  Clients authenticate via <code className="text-emerald-400 font-mono">{"{ type: 'AUTH', token: '<token>' }"}</code> and listen for server broadcasts.
                </p>
              </div>

              <div className="space-y-3">
                {realtimeEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <code className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {evt.event}
                      </code>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Target: {evt.target}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{evt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Authentication Requirement:</strong> All protected endpoints require a
                  Bearer token in the request header:{' '}
                  <code className="font-mono text-slate-900 font-bold">
                    Authorization: Bearer &lt;token&gt;
                  </code>
                  .
                </div>
              </div>

              <div className="space-y-3">
                {endpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ep.method === 'PATCH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <code className="font-mono text-slate-900 font-semibold">{ep.path}</code>
                    </div>
                    <p className="text-slate-600">{ep.desc}</p>
                    {ep.body && (
                      <div className="bg-slate-900 text-slate-200 p-2 rounded-lg font-mono text-[11px]">
                        <pre>{ep.body}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Relational tables: <code className="text-slate-700 font-mono">users</code>,{' '}
                  <code className="text-slate-700 font-mono">sessions</code>,{' '}
                  <code className="text-slate-700 font-mono">employees</code>,{' '}
                  <code className="text-slate-700 font-mono">managers</code>,{' '}
                  <code className="text-slate-700 font-mono">expenses</code>,{' '}
                  <code className="text-slate-700 font-mono">notifications</code>
                </span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[380px] leading-relaxed">
                <pre>{sqlContent || 'Loading schema.sql...'}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
