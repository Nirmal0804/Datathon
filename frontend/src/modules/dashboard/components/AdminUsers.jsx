import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Plus, Trash2, ShieldCheck, X, Shield } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';

export default function AdminUsers() {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserModal, setAddUserModal] = useState(false);

  // Initial mock users list
  const [usersList, setUsersList] = useState([
    { username: 'patil_cp', name: 'Inspector Patil', role: 'Field Officer', station: 'Cubbon Park PS', email: 'patil@ksp.gov.in', active: true },
    { username: 'analyst_rao', name: 'Analyst Rao', role: 'Intelligence Analyst', station: 'Command HQ', email: 'rao.i@ksp.gov.in', active: true },
    { username: 'gowda_admin', name: 'Admin Gowda', role: 'Administrator', station: 'State Tech HQ', email: 'gowda.sys@ksp.gov.in', active: true },
    { username: 'kumar_in', name: 'Inspector Kumar', role: 'Field Officer', station: 'Indiranagar PS', email: 'kumar.in@ksp.gov.in', active: true },
    { username: 'sergeant_desai', name: 'Sergeant Desai', role: 'Field Officer', station: 'HSR Layout PS', email: 'desai.s@ksp.gov.in', active: false },
  ]);

  // Form State
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    role: 'Field Officer',
    station: 'Cubbon Park PS',
    email: ''
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;
    const q = searchQuery.toLowerCase();
    return usersList.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.station.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [usersList, searchQuery]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.name || !newUser.email) {
      addToast({ title: 'Validation Error', message: 'Required fields missing.', type: 'danger' });
      return;
    }
    const created = {
      username: newUser.username.toLowerCase(),
      name: newUser.name,
      role: newUser.role,
      station: newUser.station,
      email: newUser.email,
      active: true
    };
    setUsersList(prev => [...prev, created]);
    setAddUserModal(false);
    setNewUser({
      username: '',
      name: '',
      role: 'Field Officer',
      station: 'Cubbon Park PS',
      email: ''
    });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">System User Management</h2>
            <p className="text-2xs text-slate-400 mt-0.5">Control active operational credentials and station accounts.</p>
          </div>
        </div>
        
        <button onClick={() => setAddUserModal(true)} className="btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Registered Accounts</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-8 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" aria-label="System users table">
            <thead>
              <tr className="border-b border-slate-800 text-3xs font-semibold text-slate-500 uppercase">
                <th className="py-2.5 px-3">User Identification</th>
                <th className="py-2.5 px-3">Role Classification</th>
                <th className="py-2.5 px-3">Assigned Unit</th>
                <th className="py-2.5 px-3">Contact Email</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.username} className="border-b border-slate-800/40 hover:bg-slate-800/20 text-xs transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <p className="font-semibold text-slate-200">{user.name}</p>
                      <p className="text-4xs text-slate-500 font-mono">@{user.username}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 text-2xs px-2 py-0.5 rounded-full ${
                      user.role === 'Administrator' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      user.role === 'Intelligence Analyst' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-350">{user.station}</td>
                  <td className="py-3 px-3 text-slate-450 font-mono text-3xs">{user.email}</td>
                  <td className="py-3 px-3 text-right">
                    <button 
                      onClick={() => handleToggleStatus(user.username)}
                      className={`btn-sm px-3.5 font-medium rounded ${
                        user.active 
                          ? 'bg-slate-800 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400' 
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'
                      }`}
                    >
                      {user.active ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {addUserModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleAddUser}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Register System Account
                </h3>
                <button type="button" onClick={() => setAddUserModal(false)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label text-3xs">Username (Unique handle)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. patil_cp"
                    className="input text-xs h-9"
                    value={newUser.username}
                    onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label text-3xs">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Inspector Patil"
                    className="input text-xs h-9"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label text-3xs">Roster Role</label>
                  <select 
                    value={newUser.role} 
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                    className="select text-xs h-9"
                  >
                    <option value="Field Officer">Field Officer</option>
                    <option value="Intelligence Analyst">Intelligence Analyst</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="label text-3xs">Precinct / Hub Station</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Cubbon Park PS"
                    className="input text-xs h-9"
                    value={newUser.station}
                    onChange={(e) => setNewUser(prev => ({ ...prev, station: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label text-3xs">Official Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. name@ksp.gov.in"
                    className="input text-xs h-9"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setAddUserModal(false)} className="btn-secondary btn-sm px-4">Cancel</button>
                <button type="submit" className="btn-primary btn-sm px-5">Create Account</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
