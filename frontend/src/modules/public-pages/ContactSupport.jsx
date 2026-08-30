import React, { useState } from 'react';
import { Mail, Send, RotateCcw, Shield, CheckCircle, Loader2 } from 'lucide-react';
import InfoPageLayout from './components/InfoPageLayout';

const CATEGORIES = [
  'Account Access',
  'Technical Issue',
  'Data Issue',
  'Security Issue',
  'General Question',
];

export default function ContactSupport({ onNavigate, onLoginClick, role = null }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    category: 'Account Access',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Official email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!form.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }
    if (!form.message.trim()) {
      newErrors.message = 'Detailed message is required.';
    }
    return newErrors;
  };

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleClear = () => {
    setForm({
      fullName: '',
      email: '',
      category: 'Account Access',
      subject: '',
      message: '',
    });
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    // Purely local frontend timeout simulation (no API calls)
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedRef = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
      setReferenceId(generatedRef);
      setSubmitted(true);
    }, 450);
  };

  const handleResetForm = () => {
    setForm({
      fullName: '',
      email: '',
      category: 'Account Access',
      subject: '',
      message: '',
    });
    setErrors({});
    setSubmitted(false);
    setReferenceId('');
  };

  return (
    <InfoPageLayout
      title="Contact Support"
      category="Support"
      description="Submit operational inquiries, report platform technical anomalies, or request credential support from the administrative desk."
      activeRoute="/contact-support"
      onNavigate={onNavigate}
      onLoginClick={onLoginClick}
      role={role}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact Form / Success Card (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E7ECF3] rounded-[20px] p-6 sm:p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-6 sm:py-8 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                  Request Submitted Successfully
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                  Thank you. Your support request has been received.
                </p>
              </div>

              {referenceId && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-mono font-bold text-[#0B1F4D]">
                  <span className="text-[#64748B]">Reference Number:</span>
                  <span className="text-[#0B1F4D]">{referenceId}</span>
                </div>
              )}

              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-[#E7ECF3]/60 pb-1.5">
                  <span className="text-[#64748B] font-medium">Submitted By:</span>
                  <span className="font-bold text-[#0F172A]">{form.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-[#E7ECF3]/60 pb-1.5">
                  <span className="text-[#64748B] font-medium">Official Email:</span>
                  <span className="font-bold text-[#0F172A]">{form.email}</span>
                </div>
                <div className="flex justify-between border-b border-[#E7ECF3]/60 pb-1.5">
                  <span className="text-[#64748B] font-medium">Category:</span>
                  <span className="font-bold text-[#0F172A]">{form.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B] font-medium">Subject:</span>
                  <span className="font-bold text-[#0F172A] truncate max-w-[200px]">{form.subject}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another Request</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#C79A2B]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Submit an Operational Request</h2>
                  <p className="text-xs text-[#64748B] font-semibold">Complete the details below to log a support ticket</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Officer / Analyst Name"
                      value={form.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`w-full h-10 px-3.5 bg-[#F8F9FB] border text-xs font-semibold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.fullName
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                          : 'border-[#E7ECF3] focus:ring-[#0B1F4D]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Official Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="officer@ksp.gov.in"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`w-full h-10 px-3.5 bg-[#F8F9FB] border text-xs font-semibold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                          : 'border-[#E7ECF3] focus:ring-[#0B1F4D]'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Issue Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="w-full h-10 px-3 bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F4D] transition-all cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of issue"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className={`w-full h-10 px-3.5 bg-[#F8F9FB] border text-xs font-semibold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.subject
                          ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                          : 'border-[#E7ECF3] focus:ring-[#0B1F4D]'
                      }`}
                    />
                    {errors.subject && (
                      <p className="text-[11px] text-red-600 font-medium mt-1">{errors.subject}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Detailed Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Describe the incident, error code, affected case ID, or required access adjustment..."
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`w-full p-3.5 bg-[#F8F9FB] border text-xs font-semibold text-[#0F172A] rounded-xl focus:outline-none focus:ring-2 transition-all leading-relaxed resize-none ${
                      errors.message
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/30'
                        : 'border-[#E7ECF3] focus:ring-[#0B1F4D]'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.message}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#0B1F4D] hover:bg-[#153E75] disabled:opacity-70 text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-[#C79A2B] animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-[#C79A2B]" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleClear}
                    className="px-4 py-2.5 rounded-xl bg-[#F8F9FB] hover:bg-slate-200 text-[#64748B] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Sidebar Info Card (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0B1F4D]/5 text-[#0B1F4D] flex items-center justify-center">
                <Shield className="w-4 h-4 text-[#C79A2B]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">Direct Support Channels</h3>
                <p className="text-[11px] text-[#64748B] font-semibold">Departmental assistance</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-[#475569]">
              <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
                <span className="font-bold text-[#0F172A] block">Operational Support Hours</span>
                <p className="text-[11px] text-[#64748B]">24x7 Continuous Telemetry & Incident Monitoring</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-[#E7ECF3] space-y-1">
                <span className="font-bold text-[#0F172A] block">Critical Security Incidents</span>
                <p className="text-[11px] text-[#64748B]">Notify the designated Station House Officer (SHO) or Cyber Crime Division.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </InfoPageLayout>
  );
}
