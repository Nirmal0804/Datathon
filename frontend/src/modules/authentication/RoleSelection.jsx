import React, { useState } from 'react';
import { Shield, User, ShieldAlert, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import kspLogo from '../../assets/ksp-official-logo.webp';
import LazyImage from '../../components/ui/LazyImage';

const roles = [
  { id: 'officer', name: 'Field Officer', icon: User, desc: 'Access station-level reports and active cases.' },
  { id: 'analyst', name: 'Intelligence Analyst', icon: Shield, desc: 'Access predictive models and network graphs.' },
  { id: 'admin', name: 'System Administrator', icon: ShieldAlert, desc: 'Manage users, roles, and system configurations.' }
];

export default function RoleSelection({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans text-[#111827] selection:bg-[#153E75]/10 selection:text-[#153E75]">
      {/* Soft background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#153E75]/4 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Navigation Top Action */}
      {onBack && (
        <div className="w-full max-w-5xl mb-6 relative z-10">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4B5563] hover:text-[#153E75] transition-colors duration-200 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Home
          </button>
        </div>
      )}

      {/* Main Authentication Container */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white border border-[#E6E8EC] rounded-[24px] w-full max-w-5xl p-8 sm:p-10 lg:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] relative z-10"
      >
        {/* Header with Official Karnataka Police Logo */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="mb-6 flex justify-center">
            <div className="h-20 sm:h-24 w-20 sm:w-24 overflow-hidden flex items-center justify-center">
              <LazyImage 
                src={kspLogo} 
                alt="Karnataka State Police Emblem" 
                className="h-20 sm:h-24 w-auto object-contain"
                containerClassName="w-full h-full"
                loading="eager"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight mb-2">Select Access Level</h1>
          <p className="text-[#6B7280] text-sm sm:text-base font-normal max-w-md mx-auto">Identify your operational role to proceed securely.</p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {roles.map((role) => {
            const isSelected = selected === role.id;
            return (
              <div 
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`p-6 sm:p-7 rounded-[20px] border transition-all duration-300 cursor-pointer flex flex-col justify-between relative group ${
                  isSelected 
                    ? 'bg-[#153E75]/5 border-2 border-[#153E75] shadow-[0_8px_24px_rgba(21,62,117,0.08)]' 
                    : 'bg-white border-[#E6E8EC] hover:border-[#153E75]/30 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-colors duration-300 ${
                      isSelected 
                        ? 'bg-[#153E75] text-white border-[#153E75]' 
                        : 'bg-[#153E75]/6 text-[#153E75] border-[#153E75]/10 group-hover:bg-[#153E75]/12'
                    }`}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-[#153E75]" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#111827] mb-2">{role.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">{role.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6E8EC]/60 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-[#153E75]' : 'text-[#6B7280] group-hover:text-[#111827]'}>
                    {isSelected ? 'Selected' : 'Click to select'}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                    isSelected ? 'text-[#153E75] translate-x-0.5' : 'text-[#9CA3AF] group-hover:translate-x-0.5 group-hover:text-[#153E75]'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onSelect(selected)}
          disabled={!selected}
          className="w-full py-4 bg-[#153E75] hover:bg-[#0F2D56] disabled:bg-[#E6E8EC] disabled:text-[#9CA3AF] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(21,62,117,0.2)] hover:shadow-[0_6px_20px_rgba(21,62,117,0.3)] hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm sm:text-base"
        >
          Continue to Login
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
