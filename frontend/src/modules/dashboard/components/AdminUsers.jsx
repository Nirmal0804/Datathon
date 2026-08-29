import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, ShieldCheck, X, Shield, MapPin, ChevronLeft, ChevronRight, RotateCcw, Download, Filter } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import EmptyState from '../../../components/common/EmptyState';

// ─── Role badge styling ───────────────────────────────────────────────────────
const roleBadge = (role) => {
  switch (role) {
    case 'Administrator':
      return { cls: 'bg-rose-50 text-rose-700 border border-rose-200', dot: 'bg-rose-500' };
    case 'Intelligence Analyst':
      return { cls: 'bg-violet-50 text-violet-700 border border-violet-200', dot: 'bg-violet-500' };
    default: // Field Officer
      return { cls: 'bg-sky-50 text-sky-700 border border-sky-200', dot: 'bg-sky-500' };
  }
};

// ─── Avatar color by role ─────────────────────────────────────────────────────
const avatarBg = (role) => {
  switch (role) {
    case 'Administrator':      return 'bg-rose-100 text-rose-700';
    case 'Intelligence Analyst': return 'bg-violet-100 text-violet-700';
    default:                   return 'bg-sky-100 text-sky-700';
  }
};

// ─── Initials from name ───────────────────────────────────────────────────────
const getInitials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

const ROLES = ['All', 'Field Officer', 'Intelligence Analyst', 'Administrator'];
const STATUSES = ['All', 'Active', 'Suspended'];
const ITEMS_PER_PAGE = 6;

export default function AdminUsers() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery]   = useState('');
  const [roleFilter, setRoleFilter]     = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [addUserModal, setAddUserModal] = useState(false);
  const [currentPage, setCurrentPage]  = useState(1);

  // Initial mock users list
  const [usersList, setUsersList] = useState([
    { username: 'patil_cp',        name: 'Inspector Patil',   role: 'Field Officer',         station: 'Cubbon Park PS',  email: 'patil@ksp.gov.in',       active: true  },
    { username: 'analyst_rao',     name: 'Analyst Rao',       role: 'Intelligence Analyst',  station: 'Command HQ',      email: 'rao.i@ksp.gov.in',        active: true  },
    { username: 'gowda_admin',     name: 'Admin Gowda',       role: 'Administrator',         station: 'State Tech HQ',   email: 'gowda.sys@ksp.gov.in',   active: true  },
    { username: 'kumar_in',        name: 'Inspector Kumar',   role: 'Field Officer',         station: 'Indiranagar PS',  email: 'kumar.in@ksp.gov.in',     active: true  },
    { username: 'sergeant_desai',  name: 'Sergeant Desai',    role: 'Field Officer',         station: 'HSR Layout PS',   email: 'desai.s@ksp.gov.in',      active: false },
    { username: 'nair_intel',      name: 'Officer Nair',      role: 'Intelligence Analyst',  station: 'North Division',  email: 'nair.o@ksp.gov.in',       active: true  },
  ]);

  // Form State
  const [newUser, setNewUser] = useState({
    username: '', name: '', role: 'Field Officer', station: 'Cubbon Park PS', email: ''
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    setCurrentPage(1);
    let list = [...usersList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.station.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'All') {
      list = list.filter(u => u.role === roleFilter);
    }
    if (statusFilter === 'Active') {
      list = list.filter(u => u.active);
    } else if (statusFilter === 'Suspended') {
      list = list.filter(u => !u.active);
    }
    return list;
  }, [usersList, searchQuery, roleFilter, statusFilter]);

  const totalPages   = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.email) {
      addToast({ title: 'Validation Error', message: 'Required fields missing.', type: 'danger' });
      return;
    }
    const created = { ...newUser, username: newUser.username.toLowerCase(), active: true };
    setUsersList(prev => [...prev, created]);
    setAddUserModal(false);
    setNewUser({ username: '', name: '', role: 'Field Officer', station: 'Cubbon Park PS', email: '' });
    addToast({ title: 'User Account Created', message: `Account for ${created.name} successfully registered.`, type: 'success' });
  };

  const handleToggleStatus = (username) => {
    setUsersList(prev => prev.map(u => {
      if (u.username === username) {
        const nextState = !u.active;
        addToast({
          title: nextState ? 'Account Activated' : 'Account Suspended',
          message: `User ${u.name} status updated successfully.`,
          type: nextState ? 'success' : 'warning'
        });
        return { ...u, active: nextState };
      }
      return u;
    }));
  };

  const handleExportUsersCSV = () => {
    const headers = ['Name', 'Badge ID', 'Username', 'Role', 'Station / Precinct', 'Status', 'Last Login'];
    const rows = filteredUsers.map((u) => [
      `"${u.name}"`,
      `"${u.badge}"`,
      `"${u.username}"`,
      `"${u.role}"`,
      `"${u.station}"`,
      u.active ? '"ACTIVE"' : '"SUSPENDED"',
      `"${u.lastLogin}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_System_Users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'Users Roster Exported',
      message: `Exported ${filteredUsers.length} user accounts to CSV file.`,
      type: 'success',
    });
  };

  const selectBase = "h-9 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[12px] pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all cursor-pointer appearance-none";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-12">

      {/* ── 1. Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">System User Management</h1>
              <span className="bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10 px-3 py-0.5 rounded-full font-extrabold text-xs">
                {usersList.length} Accounts
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Control active operational credentials and station accounts.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddUserModal(true)}
          className="h-10 px-5 rounded-full bg-[#0B1F4D] hover:bg-[#143275] text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C79A2B]" />
          <span>Add System User</span>
        </button>
      </div>

      {/* ── 2. Filter Toolbar ────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search users by name, role, or station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] text-xs font-semibold rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectBase}>
            {ROLES.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectBase}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={handleResetFilters}
          title="Reset filters"
          className="h-9 w-9 rounded-[12px] bg-[#F8F9FB] border border-[#E7ECF3] text-[#0F172A] hover:bg-[#0B1F4D] hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Export Users */}
        <button
          onClick={handleExportUsersCSV}
          title="Export user accounts as CSV"
          className="h-9 px-4 rounded-[12px] bg-[#0B1F4D] text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#143275] transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#C79A2B]" />
          <span>Export Users</span>
        </button>
      </div>

      {/* ── 3. Data Grid ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] shadow-sm overflow-hidden">

        {/* Grid Header */}
        <div className="px-6 py-4 border-b border-[#E7ECF3] bg-[#F8F9FB] flex items-center justify-between">
          <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Registered Accounts</h3>
          <span className="text-xs font-semibold text-[#64748B]">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" aria-label="System users table">
            <thead>
              <tr className="border-b border-[#E7ECF3] bg-[#F8F9FB]">
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider">User</th>
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider">Role</th>
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider">Assigned Unit</th>
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider">Email</th>
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-6 text-xs font-black text-[#0F172A] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7ECF3]/60">
              <AnimatePresence mode="popLayout">
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4">
                      <EmptyState
                        type="users"
                        onAction={handleResetFilters}
                        actionLabel="Reset Filters"
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => {
                    const badge   = roleBadge(user.role);
                    const avBg    = avatarBg(user.role);
                    const initials = getInitials(user.name);
                    return (
                      <motion.tr
                        key={user.username}
                        layout
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="h-16 hover:bg-[#F8F9FB] transition-colors duration-150 cursor-pointer group"
                      >
                        {/* User avatar + name + username */}
                        <td className="px-6 py-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${avBg} flex items-center justify-center font-black text-xs shrink-0`}>
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A] text-sm">{user.name}</p>
                              <p className="text-[11px] font-mono font-semibold text-[#64748B] mt-0.5">@{user.username}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role pill */}
                        <td className="px-6 py-3.5 align-middle">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {user.role}
                          </span>
                        </td>

                        {/* Station */}
                        <td className="px-6 py-3.5 align-middle">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                            <span className="text-xs font-bold text-[#0F172A]">{user.station}</span>
                          </div>
                        </td>

                        {/* Email — muted */}
                        <td className="px-6 py-3.5 align-middle">
                          <span className="text-[11px] font-semibold text-[#64748B] font-mono">{user.email}</span>
                        </td>

                        {/* Status indicator */}
                        <td className="px-6 py-3.5 align-middle">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-extrabold text-[11px] ${
                            user.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {user.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>

                        {/* Actions — Suspend / Activate */}
                        <td className="px-6 py-3.5 align-middle text-right">
                          <button
                            onClick={() => handleToggleStatus(user.username)}
                            className={`h-8 px-4 rounded-full font-extrabold text-xs transition-colors duration-150 cursor-pointer ${
                              user.active
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-600 hover:text-white hover:border-rose-600'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                            }`}
                          >
                            {user.active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── 4. Pagination Footer ──────────────────────────────────────────── */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E7ECF3] flex items-center justify-between bg-[#F8F9FB]">
            <p className="text-xs font-semibold text-[#64748B]">
              Showing{' '}
              <span className="font-extrabold text-[#0F172A]">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              –{' '}
              <span className="font-extrabold text-[#0F172A]">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
              </span>{' '}
              of{' '}
              <span className="font-extrabold text-[#0F172A]">{filteredUsers.length}</span> users
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-[10px] bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`h-8 w-8 rounded-[10px] font-bold text-xs transition-all cursor-pointer ${
                    pg === currentPage
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB]'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-[10px] bg-white border border-[#E7ECF3] text-[#0F172A] hover:bg-[#F8F9FB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. Add User Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {addUserModal && (
          <>
            {/* Backdrop — starts below the navbar, never covers it */}
            <div
              className="fixed left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm"
              style={{ top: '68px', zIndex: 1000 }}
              onClick={() => setAddUserModal(false)}
            />
            {/* Modal — positioned above backdrop, also below the navbar */}
            <div
              className="fixed left-0 right-0 bottom-0 flex items-start justify-center overflow-y-auto"
              style={{ top: '68px', zIndex: 1001, paddingTop: '20px', paddingBottom: '24px', paddingLeft: '16px', paddingRight: '16px' }}
              onClick={(e) => { if (e.target === e.currentTarget) setAddUserModal(false); }}
            >
            <motion.form
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onSubmit={handleAddUser}
              className="bg-white rounded-[24px] border border-[#E7ECF3] w-full max-w-md shadow-2xl flex flex-col"
              style={{ maxHeight: 'calc(100vh - 112px)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-7 py-5 bg-[#0B1F4D] rounded-t-[24px] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] bg-white/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-[#C79A2B]" />
                  </div>
                  <h3 className="text-base font-black text-white">Register System Account</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddUserModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-7 space-y-5 overflow-y-auto flex-1 min-h-0">
                {[
                  { label: 'Username (Unique handle)', key: 'username', type: 'text', placeholder: 'e.g. patil_cp' },
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Inspector Patil' },
                  { label: 'Official Email Address', key: 'email', type: 'email', placeholder: 'e.g. name@ksp.gov.in' },
                  { label: 'Precinct / Hub Station', key: 'station', type: 'text', placeholder: 'e.g. Cubbon Park PS' },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">{label}</label>
                    <input
                      type={type}
                      required={key !== 'station'}
                      placeholder={placeholder}
                      value={newUser[key]}
                      onChange={(e) => setNewUser(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full h-10 px-4 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all placeholder:text-slate-400"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-1.5">Roster Role</label>
                  <div className="relative">
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full h-10 px-4 pr-9 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px] text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all cursor-pointer appearance-none"
                    >
                      <option value="Field Officer">Field Officer</option>
                      <option value="Intelligence Analyst">Intelligence Analyst</option>
                      <option value="Administrator">Administrator</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-7 py-5 border-t border-[#E7ECF3] bg-[#F8F9FB] rounded-b-[24px] flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setAddUserModal(false)}
                  className="h-10 px-5 rounded-full bg-white border border-[#E7ECF3] font-bold text-xs text-[#0F172A] hover:bg-[#F8F9FB] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-full bg-[#0B1F4D] hover:bg-[#143275] text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C79A2B]" />
                  Create Account
                </button>
              </div>
            </motion.form>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
