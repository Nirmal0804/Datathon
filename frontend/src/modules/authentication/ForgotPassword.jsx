import React, { useState } from 'react';
import { Shield, Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import kspLogo from '../../assets/ksp-official-logo.png';

export default function ForgotPassword({ onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6F9] flex flex-col relative overflow-hidden font-sans text-[#0F172A] selection:bg-[#E00000]/10 selection:text-[#E00000]">
      
      {/* 1. TOP NAVBAR: Matching Login Page Red Header */}
      <header className="w-full bg-[#E00000] text-white px-4 sm:px-8 py-3.5 border-b border-[#C90000] shadow-sm relative z-30 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shadow-xs shrink-0">
            <img 
              src={kspLogo} 
              alt="Karnataka State Police Emblem" 
              className="h-full w-auto object-contain" 
            />
          </div>
          <div>
            <span className="text-white font-extrabold tracking-tight text-base sm:text-lg flex items-center gap-1.5 leading-none">
              KARNATAKA POLICE
              <span className="text-[10px] bg-[#D49A00] text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">KSP</span>
            </span>
            <p className="text-xs text-[#F5E7C1] font-medium tracking-wide mt-0.5">
              Crime Analytics Platform
            </p>
          </div>
        </div>

        {/* Right Navigation */}
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#F5E7C1] transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        )}
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 md:p-8 relative min-h-[calc(100vh-64px)]">

        {/* 3. CENTERED RESET CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/80 w-full max-w-[460px] relative z-20 my-auto"
        >
          {/* Card Back Button */}
          {onBack && (
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E00000] hover:underline mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </button>
          )}

          {/* Header Icon */}
          <div className="w-14 h-14 rounded-full bg-[#FFF1F1] text-[#E00000] border border-[#E00000]/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 stroke-[2]" />
          </div>
          
          <h1 className="text-2xl font-extrabold text-[#142B45] text-center mb-1 tracking-tight">
            Reset Credentials
          </h1>
          <p className="text-xs text-slate-500 text-center mb-6 font-medium">
            Enter your official ID to receive a secure reset link.
          </p>

          {isSent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center p-6 bg-emerald-50 border border-emerald-200 rounded-2xl mt-4"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-emerald-800 font-bold mb-1">Reset Link Dispatched</h3>
              <p className="text-xs text-emerald-700 font-medium">
                Please check your official email for further instructions.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#142B45] mb-1.5">
                  Official ID / Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-200 text-sm text-[#142B45] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E00000] focus:border-transparent transition-all shadow-2xs"
                    placeholder="officer.ksp@karnataka.gov.in"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#E00000] hover:bg-[#C90000] text-white font-bold text-sm rounded-full transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center cursor-pointer mt-2"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request Reset Link'}
              </button>
            </form>
          )}
        </motion.div>
      </main>
    </div>
  );
}
