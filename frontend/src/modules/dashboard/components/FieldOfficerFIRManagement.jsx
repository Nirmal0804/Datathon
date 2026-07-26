import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, X, ShieldAlert } from 'lucide-react';
import { MOCK_CASES } from './mockData';
import { useToast } from '../../../components/ui/Toast';

export default function FieldOfficerFIRManagement() {
  const { addToast } = useToast();
  const [localCases, setLocalCases] = useState(MOCK_CASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [registerModal, setRegisterModal] = useState(false);

  // Form State
  const [firForm, setFirForm] = useState({
    category: 'Cybercrime',
    district: 'Bengaluru City',
    policeStation: 'Cubbon Park PS',
    complainant: '',
    section: 'Section 379 IPC',
    description: '',
    risk: 'Medium'
  });

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return localCases;
    const q = searchQuery.toLowerCase();
    return localCases.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.policeStation.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    );
  }, [localCases, searchQuery]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!firForm.complainant || !firForm.description) {
      addToast({ title: 'Validation Error', message: 'Required fields missing.', type: 'danger' });
      return;
    }
    const newId = `FIR-2026-${1000 + localCases.length + 1}`;
    const newCase = {
      id: newId,
      category: firForm.category,
      district: firForm.district,
      policeStation: firForm.policeStation,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: new Date(),
      risk: firForm.risk,
      status: 'Active',
      arrests: 0,
      details: {
        officer: 'Inspector Patil',
        section: firForm.section,
        summary: firForm.description,
        timeline: [
          { date: 'FIR Logged', desc: `Complainant: ${firForm.complainant}. Registered by Officer Patil.` }
        ]
      }
    };

    setLocalCases(prev => [newCase, ...prev]);
    setRegisterModal(false);
    setFirForm({
      category: 'Cybercrime',
      district: 'Bengaluru City',
      policeStation: 'Cubbon Park PS',
      complainant: '',
      section: 'Section 379 IPC',
      description: '',
      risk: 'Medium'
    });
    addToast({ title: 'FIR Logged', message: `FIR ${newId} registered at Cubbon Park PS.`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">FIR Management</h2>
            <p className="text-2xs text-slate-400 mt-0.5">Register new incident complaints and view precinct intake logs.</p>
          </div>
        </div>
        
        <button onClick={() => setRegisterModal(true)} className="btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" />
          <span>Register New FIR</span>
        </button>
      </div>

      {/* Grid search and lists */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Precinct FIR Records</h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter precinct records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-8 text-xs h-8 w-60"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 no-scrollbar">
          {filteredCases.map(c => (
            <div key={c.id} className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-primary">{c.id}</span>
                <div>
                  <p className="text-slate-200 font-semibold">{c.category}</p>
                  <p className="text-slate-500 text-3xs">{c.date} • {c.policeStation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${c.risk === 'Critical' ? 'badge-critical' : c.risk === 'High' ? 'badge-high' : 'badge-medium'} py-0 px-1 text-3xs`}>
                  {c.risk}
                </span>
                <span className="text-slate-300 font-medium">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register Modal */}
      <AnimatePresence>
        {registerModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.form 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onSubmit={handleRegister}
              className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Log New Incident Report (FIR)
                </h3>
                <button type="button" onClick={() => setRegisterModal(false)} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-3xs">Crime Category</label>
                    <select 
                      value={firForm.category} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, category: e.target.value }))}
                      className="select text-xs h-9"
                    >
                      <option value="Cybercrime">Cybercrime</option>
                      <option value="Property Theft">Property Theft</option>
                      <option value="Violent Crime">Violent Crime</option>
                      <option value="Financial Fraud">Financial Fraud</option>
                      <option value="Narcotics">Narcotics</option>
                      <option value="Crime Against Women">Crime Against Women</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-3xs">AI Risk Scoring Estimate</label>
                    <select 
                      value={firForm.risk} 
                      onChange={(e) => setFirForm(prev => ({ ...prev, risk: e.target.value }))}
                      className="select text-xs h-9"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-3xs">Jurisdiction Station</label>
                    <input type="text" disabled className="input text-xs h-9 opacity-60" value={firForm.policeStation} />
                  </div>
                  <div>
                    <label className="label text-3xs">Penal Section Code</label>
                    <input 
                      type="text" 
                      className="input text-xs h-9" 
                      value={firForm.section}
                      onChange={(e) => setFirForm(prev => ({ ...prev, section: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-3xs">Complainant / Witness Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter name"
                    className="input text-xs h-9"
                    value={firForm.complainant}
                    onChange={(e) => setFirForm(prev => ({ ...prev, complainant: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="label text-3xs">Brief Briefing Narrative</label>
                  <textarea 
                    required 
                    rows="3" 
                    placeholder="Describe incident in detail..."
                    className="input text-xs pt-2"
                    value={firForm.description}
                    onChange={(e) => setFirForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
                <button type="button" onClick={() => setRegisterModal(false)} className="btn-secondary btn-sm px-4">Cancel</button>
                <button type="submit" className="btn-primary btn-sm px-5">Submit FIR</button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
