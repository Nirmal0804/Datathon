import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  User, Shield, Bell, SlidersHorizontal, ScrollText, Camera, Upload, RotateCcw,
  ZoomIn, ZoomOut, RotateCw, CheckCircle, AlertTriangle, Save, RefreshCw, X,
  Lock, Eye, EyeOff, Smartphone, ShieldCheck, Globe, Monitor, Trash2, LogOut,
  Clock, Check, Sparkles, AlertCircle, FileText, ChevronRight, Sliders, MapPin, Key
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';

// ─── Initial State Helpers ───────────────────────────────────────────────────
const getRoleDefaultProfile = (role) => {
  if (role === 'admin') {
    return {
      fullName: 'Super Admin S. Kumar',
      badgeNumber: 'KSP-2019-4821',
      rank: 'System Administrator',
      department: 'Intelligence Wing',
      email: 's.kumar@ksp.gov.in',
      phone: '9876543210',
      district: 'Bengaluru Urban',
      policeStation: 'State Tech HQ',
      avatarUrl: null,
    };
  }
  if (role === 'analyst') {
    return {
      fullName: 'Analyst S. Rao',
      badgeNumber: 'KSP-2021-9012',
      rank: 'DSP',
      department: 'Intelligence Wing',
      email: 's.rao@ksp.gov.in',
      phone: '9876543211',
      district: 'Bengaluru Urban',
      policeStation: 'State Command HQ',
      avatarUrl: null,
    };
  }
  return {
    fullName: 'Rakesh Kumar',
    badgeNumber: 'KSP-2022-3341',
    rank: 'Inspector',
    department: 'Law & Order',
    email: 'rakesh.kumar@ksp.gov.in',
    phone: '9876543210',
    district: 'Mysuru',
    policeStation: 'Mysuru Rural Police',
    avatarUrl: null,
  };
};

const RANKS = ['Constable', 'Sub-Inspector', 'Inspector', 'DSP', 'SP', 'DCP', 'ADGP', 'DG&IGP', 'System Administrator'];
const DEPARTMENTS = ['Crime Branch', 'Intelligence Wing', 'Cyber Crime', 'Law & Order', 'Traffic Police', 'Special Task Force'];
const DISTRICTS = ['Bengaluru Urban', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru', 'Belagavi', 'Kalaburagi', 'Udupi', 'Shimoga', 'Tumakuru', 'Ballari'];

export default function SettingsLayout({ role = 'admin' }) {
  const { addToast } = useToast();

  const roleDefault = useMemo(() => getRoleDefaultProfile(role), [role]);

  // Profile Form State initialized from localStorage or role defaults
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ksp_user_profile');
      if (saved) {
        return { ...roleDefault, ...JSON.parse(saved) };
      }
    } catch {}
    return roleDefault;
  });
  const [initialProfileSnapshot, setInitialProfileSnapshot] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Form Validation State
  const [errors, setErrors] = useState({});

  // Image Cropper Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Security Form State
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirmPass: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [mfaMethod, setMfaMethod] = useState('app'); // 'sms' | 'app' | 'email'

  // Active Sessions State
  const [sessions, setSessions] = useState([
    { id: '1', device: 'Chrome on Windows 11', ip: '10.14.82.11', location: 'Bengaluru HQ', time: 'Today 09:15 AM', isCurrent: true },
    { id: '2', device: 'Field Officer Tablet (Android 14)', ip: '10.14.88.24', location: 'Mysuru Patrol', time: 'Yesterday 04:30 PM', isCurrent: false },
    { id: '3', device: 'Analyst Workstation (macOS)', ip: '10.12.9.31', location: 'HQ Control Room', time: '24 Jul 11:20 AM', isCurrent: false },
  ]);

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    criticalIncidents: true,
    weeklyReports: false,
    systemMaintenance: true,
    pushNotifications: true,
    instantAI: true,
  });

  // Application Preferences State
  const [preferences, setPreferences] = useState({
    theme: 'dark', // 'system' | 'light' | 'dark'
    language: 'en', // 'en' | 'kn'
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '24h',
    mapTheme: 'dark', // 'dark' | 'satellite' | 'light'
    defaultDashboard: 'overview',
    fontSize: 'medium',
    autoSave: true,
  });

  // Danger Zone Confirmation Modal State
  const [dangerModalAction, setDangerModalAction] = useState(null);

  // Load stored avatar on mount if available
  useEffect(() => {
    const savedAvatar = localStorage.getItem('ksp_user_avatar');
    if (savedAvatar) {
      setProfile((prev) => ({ ...prev, avatarUrl: savedAvatar }));
      setInitialProfileSnapshot((prev) => ({ ...prev, avatarUrl: savedAvatar }));
      setAvatarPreview(savedAvatar);
    }
  }, []);

  // Check for unsaved profile changes
  const isProfileDirty = useMemo(() => {
    return JSON.stringify(profile) !== JSON.stringify(initialProfileSnapshot);
  }, [profile, initialProfileSnapshot]);

  // Form Validation Handler
  const validateField = (name, value) => {
    let err = '';
    if (name === 'fullName') {
      if (!value.trim()) err = 'Full Name is required';
      else if (value.trim().length < 3) err = 'Full Name must be at least 3 characters';
    } else if (name === 'email') {
      if (!value.trim()) err = 'Email is required';
      else if (!value.endsWith('@ksp.gov.in')) err = 'Email must end with @ksp.gov.in domain';
    } else if (name === 'phone') {
      if (!value.trim()) err = 'Phone number is required';
      else if (!/^[6-9]\d{9}$/.test(value.trim())) err = 'Enter valid 10-digit Indian phone number starting with 6-9';
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // ─── Image Crop & Upload Logic ───────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (≤ 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: 'Image Upload Failed',
        message: 'File size exceeds maximum allowed limit of 5 MB.',
        type: 'danger',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      addToast({
        title: 'Unsupported Format',
        message: 'Please upload a valid JPG, PNG, or WEBP image format.',
        type: 'danger',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageSrc(event.target?.result);
      setZoom(1);
      setRotation(0);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  // Render Image onto Crop Canvas
  useEffect(() => {
    if (!cropModalOpen || !rawImageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = rawImageSrc;
    img.onload = () => {
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      ctx.save();

      // Translate to center
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Draw image centered
      const minDim = Math.min(img.width, img.height);
      ctx.drawImage(
        img,
        (img.width - minDim) / 2,
        (img.height - minDim) / 2,
        minDim,
        minDim,
        -size / 2,
        -size / 2,
        size,
        size
      );

      ctx.restore();
    };
  }, [cropModalOpen, rawImageSrc, zoom, rotation]);

  const applyCroppedAvatar = () => {
    if (!canvasRef.current) return;
    try {
      const croppedDataUrl = canvasRef.current.toDataURL('image/png');
      setAvatarPreview(croppedDataUrl);
      setProfile((prev) => ({ ...prev, avatarUrl: croppedDataUrl }));
      localStorage.setItem('ksp_user_avatar', croppedDataUrl);

      // Dispatch custom event to notify other components (e.g. Navbar)
      window.dispatchEvent(new Event('ksp_avatar_updated'));

      addToast({
        title: 'Profile Photo Updated',
        message: 'Your new avatar image has been cropped and applied across the platform.',
        type: 'success',
      });
      setCropModalOpen(false);
    } catch (err) {
      addToast({
        title: 'Crop Failed',
        message: 'Image processing failed. Please try again.',
        type: 'danger',
      });
    }
  };

  const removeAvatarPhoto = () => {
    setAvatarPreview(null);
    setProfile((prev) => ({ ...prev, avatarUrl: null }));
    localStorage.removeItem('ksp_user_avatar');
    window.dispatchEvent(new Event('ksp_avatar_updated'));
    addToast({
      title: 'Photo Removed',
      message: 'Profile picture reset to default system initials.',
      type: 'info',
    });
  };

  // ─── Profile Form Submission ─────────────────────────────────────────────────
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    const isNameValid = validateField('fullName', profile.fullName);
    const isEmailValid = validateField('email', profile.email);
    const isPhoneValid = validateField('phone', profile.phone);

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      addToast({
        title: 'Validation Error',
        message: 'Please resolve form error fields before saving.',
        type: 'danger',
      });
      return;
    }

    setInitialProfileSnapshot(profile);
    localStorage.setItem('ksp_user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('ksp_profile_updated'));
    window.dispatchEvent(new Event('ksp_avatar_updated'));
    addToast({
      title: 'Profile Saved',
      message: 'Personal identity and department records updated successfully.',
      type: 'success',
    });
  };

  const handleResetProfile = () => {
    setProfile(initialProfileSnapshot);
    setErrors({});
    addToast({
      title: 'Changes Reverted',
      message: 'Restored original profile details.',
      type: 'info',
    });
  };

  // ─── Security Password Logic ─────────────────────────────────────────────────
  const passwordStrength = useMemo(() => {
    const p = passwords.newPass;
    if (!p) return { score: 0, label: 'None', color: 'bg-slate-200' };

    let score = 0;
    if (p.length >= 10) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[a-z]/.test(p)) score += 25;
    if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-rose-500', textCls: 'text-rose-600' };
    if (score <= 75) return { score, label: 'Medium', color: 'bg-amber-400', textCls: 'text-amber-600' };
    return { score, label: 'Strong', color: 'bg-emerald-500', textCls: 'text-emerald-600' };
  }, [passwords.newPass]);

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwords.current) {
      addToast({ title: 'Security Error', message: 'Current password is required.', type: 'danger' });
      return;
    }
    if (passwords.newPass.length < 10) {
      addToast({ title: 'Weak Password', message: 'New password must be at least 10 characters long.', type: 'danger' });
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      addToast({ title: 'Password Mismatch', message: 'New password and confirmation do not match.', type: 'danger' });
      return;
    }

    setPasswords({ current: '', newPass: '', confirmPass: '' });
    addToast({
      title: 'Password Updated',
      message: 'Account authentication credentials have been renewed.',
      type: 'success',
    });
  };

  const handleTerminateSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    addToast({
      title: 'Session Terminated',
      message: 'Selected device logged out from active tokens.',
      type: 'warning',
    });
  };

  const handleTerminateAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    addToast({
      title: 'All Sessions Closed',
      message: 'Terminated all secondary sessions across other devices.',
      type: 'success',
    });
  };

  // ─── Danger Zone Executions ──────────────────────────────────────────────────
  const handleConfirmDangerAction = () => {
    if (dangerModalAction === 'deactivate') {
      addToast({ title: 'Account Deactivated', message: 'Account status set to suspended. Contact Administrator.', type: 'warning' });
    } else if (dangerModalAction === 'delete') {
      addToast({ title: 'Deletion Request Sent', message: 'Account purge request submitted to Karnataka Police HQ governance team.', type: 'danger' });
    } else if (dangerModalAction === 'logout_all') {
      handleTerminateAllOtherSessions();
    } else if (dangerModalAction === 'reset_prefs') {
      setPreferences({
        theme: 'dark', language: 'en', dateFormat: 'DD-MM-YYYY', timeFormat: '24h',
        mapTheme: 'dark', defaultDashboard: 'overview', fontSize: 'medium', autoSave: true,
      });
      addToast({ title: 'Preferences Reset', message: 'All platform user preferences restored to factory defaults.', type: 'info' });
    }
    setDangerModalAction(null);
  };

  // Navigation Items List
  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: User, desc: 'Personal identity & credentials' },
    { id: 'security', label: 'Role & Security', icon: Shield, desc: 'Password, MFA & Active sessions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert channels & frequencies' },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal, desc: 'UI theme, language & formats' },
    { id: 'audit', label: 'Audit Logs', icon: ScrollText, desc: 'Security activity & audit history' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pb-16">

      {/* ── 1. Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0 shadow-xs">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Platform Settings</h1>
              <span className="bg-[#0B1F4D]/5 text-[#0B1F4D] border border-[#0B1F4D]/10 px-3 py-0.5 rounded-full font-extrabold text-xs">
                Account Governance
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Manage your account, profile, preferences, notification settings, and platform access.
            </p>
          </div>
        </div>

        {/* Top-Right Header Status & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#F8F9FB] border border-[#E7ECF3] px-3.5 py-2 rounded-full text-xs font-bold text-[#64748B]">
            <Clock className="w-3.5 h-3.5 text-[#0B1F4D]" />
            Last Updated: Today 09:15 AM
          </div>

          <div className={`px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 border ${
            isProfileDirty
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isProfileDirty ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            {isProfileDirty ? 'Unsaved Changes' : 'Synced'}
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={!isProfileDirty}
            className={`h-10 px-5 rounded-full font-extrabold text-xs transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-sm ${
              isProfileDirty
                ? 'bg-[#0B1F4D] text-white hover:bg-[#0F2A6B]'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 text-[#C79A2B]" />
            Save Changes
          </button>
        </div>
      </div>

      {/* ── 2. TWO-COLUMN LAYOUT ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* ── LEFT SIDEBAR (Permanent Settings Nav Card) ────────────────────── */}
        <div className="lg:col-span-1 bg-white border border-[#E7ECF3] rounded-[24px] p-3 shadow-sm space-y-1.5">
          <div className="px-3 py-2 border-b border-[#E7ECF3] mb-1">
            <h2 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Settings Navigation</h2>
          </div>

          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`relative w-full p-3.5 rounded-[16px] text-left transition-all duration-200 flex items-center gap-3.5 group cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-[#0B1F4D] text-white shadow-sm font-black'
                    : 'bg-white text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] font-extrabold border border-transparent'
                }`}
              >
                {/* Active Left Gold Bar Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C79A2B] rounded-r-full" />
                )}

                <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 text-base transition-colors ${
                  isActive ? 'bg-[#C79A2B]/20 text-[#C79A2B]' : 'bg-[#0B1F4D]/5 text-[#0B1F4D]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                  <p className={`text-xs tracking-tight ${isActive ? 'text-white font-black' : 'text-[#0F172A]'}`}>
                    {sec.label}
                  </p>
                  <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300 font-medium' : 'text-[#64748B] font-semibold'}`}>
                    {sec.desc}
                  </p>
                </div>

                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#C79A2B] translate-x-0.5' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`} />
              </button>
            );
          })}
        </div>

        {/* ── MAIN CONTENT PANEL ──────────────────────────────────────────────── */}
        <div className="lg:col-span-3 space-y-6">

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1: PERSONAL IDENTITY & PROFILE DETAILS
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'profile' || activeSection === 'all') && (
            <div className="space-y-6">

              {/* Profile Header Avatar Card */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                {/* Circular Avatar */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-full bg-[#0B1F4D] text-[#C79A2B] font-black text-2xl border-4 border-[#E7ECF3] flex items-center justify-center overflow-hidden shadow-md">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile?.fullName || 'User Avatar'} className="w-full h-full object-cover" />
                    ) : (
                      <span>{(profile?.fullName || 'User Name').split(' ').filter(Boolean).map((n) => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  {/* Camera overlay */}
                  <label
                    htmlFor="avatar-upload-input"
                    className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                  </label>
                  <input
                    ref={fileInputRef}
                    id="avatar-upload-input"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Profile Identity Text Info */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-[#0F172A] tracking-tight">{profile.fullName}</h2>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className="bg-[#0B1F4D] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                          {profile.rank}
                        </span>
                        <span className="bg-[#F8F9FB] border border-[#E7ECF3] text-[#0B1F4D] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full font-mono">
                          {profile.badgeNumber}
                        </span>
                        <span className="text-xs font-semibold text-[#64748B]">
                          {profile.policeStation}
                        </span>
                      </div>
                    </div>

                    {/* Photo Action Buttons */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 px-4 rounded-full border border-[#0B1F4D]/20 bg-[#0B1F4D]/5 text-[#0B1F4D] text-xs font-extrabold hover:bg-[#0B1F4D] hover:text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload New Photo
                      </button>

                      {profile.avatarUrl && (
                        <button
                          onClick={removeAvatarPhoto}
                          className="h-9 px-3 rounded-full border border-rose-200 bg-rose-50 text-rose-600 text-xs font-extrabold hover:bg-rose-600 hover:text-white transition-colors duration-150 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-medium text-[#64748B] mt-2">
                    JPG, PNG, or WEBP up to 5MB. Circular cropping tool automatically formats avatar across platform headers.
                  </p>
                </div>
              </div>

              {/* Profile Details Form (2-Column Grid) */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
                <div className="border-b border-[#E7ECF3] pb-4">
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Personal Identity &amp; Department Credentials</h3>
                  <p className="text-xs font-semibold text-[#64748B] mt-0.5">Official personnel roster attributes and station contact details.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Full Name *</label>
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => handleProfileChange('fullName', e.target.value)}
                          className={`w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border text-xs font-bold text-[#0F172A] focus:outline-none transition-all ${
                            errors.fullName ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-[#E7ECF3] focus:border-[#0B1F4D]'
                          }`}
                        />
                        {errors.fullName && <p className="text-[10px] font-extrabold text-rose-600 mt-1">{errors.fullName}</p>}
                      </div>

                      {/* Badge Number (Read Only) */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5 flex items-center justify-between">
                          <span>Badge Number (Read-Only)</span>
                          <span className="text-[10px] text-slate-400 font-bold">Immutable System ID</span>
                        </label>
                        <input
                          type="text"
                          value={profile.badgeNumber}
                          readOnly
                          className="w-full h-10 px-4 rounded-[14px] bg-slate-100 border border-slate-200 text-xs font-mono font-extrabold text-slate-500 cursor-not-allowed select-none"
                        />
                        <p className="text-[10px] text-[#64748B] mt-1">Badge ID is assigned by KSP Headquarters governance team.</p>
                      </div>

                      {/* Rank Dropdown */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Official Rank</label>
                        <select
                          value={profile.rank}
                          onChange={(e) => handleProfileChange('rank', e.target.value)}
                          className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D] transition-all cursor-pointer"
                        >
                          {RANKS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      {/* Department Dropdown */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Department / Wing</label>
                        <select
                          value={profile.department}
                          onChange={(e) => handleProfileChange('department', e.target.value)}
                          className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D] transition-all cursor-pointer"
                        >
                          {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Official Email */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Official Email Address *</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleProfileChange('email', e.target.value)}
                          className={`w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border text-xs font-bold text-[#0F172A] focus:outline-none transition-all ${
                            errors.email ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-[#E7ECF3] focus:border-[#0B1F4D]'
                          }`}
                        />
                        {errors.email ? (
                          <p className="text-[10px] font-extrabold text-rose-600 mt-1">{errors.email}</p>
                        ) : (
                          <p className="text-[10px] text-[#64748B] mt-1">Must be an active @ksp.gov.in official mailbox.</p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Contact Mobile (+91) *</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) => handleProfileChange('phone', e.target.value)}
                          className={`w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border text-xs font-bold text-[#0F172A] focus:outline-none transition-all ${
                            errors.phone ? 'border-rose-500 focus:ring-2 focus:ring-rose-200' : 'border-[#E7ECF3] focus:border-[#0B1F4D]'
                          }`}
                        />
                        {errors.phone && <p className="text-[10px] font-extrabold text-rose-600 mt-1">{errors.phone}</p>}
                      </div>

                      {/* District Dropdown */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Assigned District</label>
                        <select
                          value={profile.district}
                          onChange={(e) => handleProfileChange('district', e.target.value)}
                          className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D] transition-all cursor-pointer"
                        >
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      {/* Police Station / HQ */}
                      <div>
                        <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Police Station / HQ Post</label>
                        <input
                          type="text"
                          value={profile.policeStation}
                          onChange={(e) => handleProfileChange('policeStation', e.target.value)}
                          className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D] transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Footer Action Bar */}
                  <div className="pt-4 border-t border-[#E7ECF3] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResetProfile}
                      disabled={!isProfileDirty}
                      className={`h-9 px-4 rounded-full border text-xs font-extrabold transition-colors cursor-pointer ${
                        isProfileDirty
                          ? 'border-[#E7ECF3] text-[#64748B] hover:bg-[#F8F9FB]'
                          : 'border-slate-200 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Reset Changes
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={!isProfileDirty}
                        className={`h-9 px-6 rounded-full font-extrabold text-xs transition-all shadow-sm cursor-pointer ${
                          isProfileDirty
                            ? 'bg-[#0B1F4D] text-white hover:bg-[#0F2A6B]'
                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        }`}
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2: SECURITY & ROLE MANAGEMENT
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'security' || activeSection === 'all') && (
            <div className="space-y-6">

              {/* Change Password Card */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
                <div className="border-b border-[#E7ECF3] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Change Password</h3>
                    <p className="text-xs font-semibold text-[#64748B] mt-0.5">Ensure your authentication credentials comply with KSP cyber security guidelines.</p>
                  </div>
                  <Lock className="w-5 h-5 text-[#0B1F4D]" />
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Current Password */}
                    <div>
                      <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={passwords.current}
                          onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                          placeholder="••••••••••••"
                          className="w-full h-10 pl-4 pr-10 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={passwords.newPass}
                          onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
                          placeholder="Min 10 characters"
                          className="w-full h-10 pl-4 pr-10 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={passwords.confirmPass}
                          onChange={(e) => setPasswords((p) => ({ ...p, confirmPass: e.target.value }))}
                          placeholder="Re-type new password"
                          className="w-full h-10 pl-4 pr-10 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0B1F4D]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A]"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Meter */}
                  {passwords.newPass && (
                    <div className="bg-[#F8F9FB] border border-[#E7ECF3] p-4 rounded-[18px] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-[#0F172A]">Password Strength:</span>
                        <span className={`font-black uppercase ${passwordStrength.textCls}`}>{passwordStrength.label}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${passwordStrength.score}%` }} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[10px] font-bold text-[#64748B]">
                        <span className={passwords.newPass.length >= 10 ? 'text-emerald-600' : ''}>✓ Min 10 Chars</span>
                        <span className={/[A-Z]/.test(passwords.newPass) ? 'text-emerald-600' : ''}>✓ Uppercase Letter</span>
                        <span className={/[a-z]/.test(passwords.newPass) ? 'text-emerald-600' : ''}>✓ Lowercase Letter</span>
                        <span className={/[0-9]/.test(passwords.newPass) && /[^A-Za-z0-9]/.test(passwords.newPass) ? 'text-emerald-600' : ''}>✓ Number &amp; Symbol</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="h-9 px-5 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#0F2A6B] transition-colors shadow-sm cursor-pointer"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* Multi-Factor Authentication Card */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Multi-Factor Authentication (MFA)</h3>
                    <p className="text-xs font-semibold text-[#64748B] mt-0.5">Require multi-step OTP verification during user authentication.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMfaEnabled(!mfaEnabled);
                      addToast({
                        title: !mfaEnabled ? 'MFA Enabled' : 'MFA Disabled',
                        message: !mfaEnabled ? 'Two-factor OTP authentication activated.' : 'MFA deactivated for your account.',
                        type: !mfaEnabled ? 'success' : 'warning',
                      });
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                      mfaEnabled ? 'bg-emerald-500' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${mfaEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {mfaEnabled && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <p className="text-xs font-extrabold text-[#0F172A]">Select Preferred OTP Delivery Method:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'sms', label: 'Phone SMS OTP', desc: `Send 6-digit code to +91 ${profile.phone}`, icon: Smartphone },
                        { id: 'app', label: 'Authenticator App (TOTP)', desc: 'Google Authenticator or Microsoft Auth app', icon: ShieldCheck },
                        { id: 'email', label: 'Email OTP', desc: `Send login OTP code to ${profile.email}`, icon: Key },
                      ].map(({ id, label, desc, icon: Icon }) => (
                        <div
                          key={id}
                          onClick={() => setMfaMethod(id)}
                          className={`p-4 rounded-[18px] border cursor-pointer transition-all ${
                            mfaMethod === id
                              ? 'border-[#0B1F4D] bg-[#F4F7FF] ring-2 ring-[#0B1F4D]/10'
                              : 'border-[#E7ECF3] bg-[#F8F9FB] hover:border-[#0B1F4D]/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${mfaMethod === id ? 'bg-[#0B1F4D] text-[#C79A2B]' : 'bg-slate-200 text-slate-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#0F172A]">{label}</p>
                              <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">{desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Sessions Card */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Active Device Sessions</h3>
                    <p className="text-xs font-semibold text-[#64748B] mt-0.5">Manage active JWT tokens and logged-in hardware devices.</p>
                  </div>

                  <button
                    onClick={handleTerminateAllOtherSessions}
                    className="h-8 px-3 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-xs font-extrabold hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                  >
                    Terminate All Other Sessions
                  </button>
                </div>

                <div className="space-y-3">
                  {sessions.map((s) => (
                    <div key={s.id} className="p-4 rounded-[18px] bg-[#F8F9FB] border border-[#E7ECF3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-lg ${s.isCurrent ? 'bg-[#0B1F4D] text-[#C79A2B]' : 'bg-slate-200 text-slate-700'}`}>
                          <Monitor className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-black text-[#0F172A]">{s.device}</p>
                            {s.isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                                THIS DEVICE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">
                            IP: {s.ip} · {s.location} · {s.time}
                          </p>
                        </div>
                      </div>

                      {!s.isCurrent && (
                        <button
                          onClick={() => handleTerminateSession(s.id)}
                          className="h-8 px-3 rounded-full border border-rose-200 bg-white text-rose-600 text-xs font-extrabold hover:bg-rose-600 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3: NOTIFICATION PREFERENCES
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'notifications' || activeSection === 'all') && (
            <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#E7ECF3] pb-4">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Notification &amp; Alert Preferences</h3>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5">Configure operational alert channels, critical incident dispatches and intelligence digest emails.</p>
              </div>

              <div className="divide-y divide-[#E7ECF3]">
                {[
                  { key: 'emailAlerts', label: 'Email Notifications', desc: 'Receive official intelligence reports and audit activity summaries via email.' },
                  { key: 'smsAlerts', label: 'SMS Security Alerts', desc: 'High-priority SMS alerts for urgent precinct incidents and password modifications.' },
                  { key: 'criticalIncidents', label: 'Critical Incident Dispatch Alerts', desc: 'Real-time broadcast for major law & order events and emergency dispatches.' },
                  { key: 'weeklyReports', label: 'Weekly Analytical Summary Digest', desc: 'Automated weekly crime trend graph statistics emailed every Monday.' },
                  { key: 'systemMaintenance', label: 'System Maintenance Alerts', desc: 'Notifications regarding database backups, patch deployments, and server health.' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Desktop browser alert notifications when active on the platform.' },
                  { key: 'instantAI', label: 'Instant AI Crime Pattern Alerts', desc: 'Predictive notifications when AI models detect emerging crime clusters.' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-[#0F172A]">{label}</p>
                      <p className="text-[11px] font-medium text-[#64748B] mt-0.5">{desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !notifications[key];
                        setNotifications((prev) => ({ ...prev, [key]: nextVal }));
                        addToast({
                          title: 'Preference Saved',
                          message: `"${label}" set to ${nextVal ? 'ENABLED' : 'DISABLED'}.`,
                          type: 'success',
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                        notifications[key] ? 'bg-emerald-500' : 'bg-[#CBD5E1]'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notifications[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4: APPLICATION PREFERENCES
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'preferences' || activeSection === 'all') && (
            <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#E7ECF3] pb-4">
                <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Application &amp; Workspace Preferences</h3>
                <p className="text-xs font-semibold text-[#64748B] mt-0.5">Customize UI theme, default dashboard view, spatial map themes, and regional language.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-2">Color Theme Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'system', label: 'System' },
                      { id: 'light', label: 'Light' },
                      { id: 'dark', label: 'Dark Navy' },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreferences((p) => ({ ...p, theme: id }))}
                        className={`h-9 rounded-[12px] text-xs font-extrabold transition-all cursor-pointer ${
                          preferences.theme === id
                            ? 'bg-[#0B1F4D] text-white shadow-xs'
                            : 'bg-[#F8F9FB] border border-[#E7ECF3] text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-2">Platform Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'en', label: 'English (UK/IN)' },
                      { id: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreferences((p) => ({ ...p, language: id }))}
                        className={`h-9 rounded-[12px] text-xs font-extrabold transition-all cursor-pointer ${
                          preferences.language === id
                            ? 'bg-[#0B1F4D] text-white shadow-xs'
                            : 'bg-[#F8F9FB] border border-[#E7ECF3] text-[#64748B] hover:text-[#0F172A]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Format */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Date Format</label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences((p) => ({ ...p, dateFormat: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="DD-MM-YYYY">DD-MM-YYYY (26-07-2026)</option>
                    <option value="MM-DD-YYYY">MM-DD-YYYY (07-26-2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-26)</option>
                  </select>
                </div>

                {/* Time Format */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Time Format</label>
                  <select
                    value={preferences.timeFormat}
                    onChange={(e) => setPreferences((p) => ({ ...p, timeFormat: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="24h">24 Hour (14:30 IST)</option>
                    <option value="12h">12 Hour (02:30 PM IST)</option>
                  </select>
                </div>

                {/* Map Theme */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">GIS Map Layer Theme</label>
                  <select
                    value={preferences.mapTheme}
                    onChange={(e) => setPreferences((p) => ({ ...p, mapTheme: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="dark">Dark Tactical Base</option>
                    <option value="satellite">High-Res Satellite Imagery</option>
                    <option value="light">Light Standard Topographic</option>
                  </select>
                </div>

                {/* Default Dashboard */}
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1.5">Default Dashboard Landing</label>
                  <select
                    value={preferences.defaultDashboard}
                    onChange={(e) => setPreferences((p) => ({ ...p, defaultDashboard: e.target.value }))}
                    className="w-full h-10 px-4 rounded-[14px] bg-[#F8F9FB] border border-[#E7ECF3] text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
                  >
                    <option value="overview">Executive Overview</option>
                    <option value="last">Last Opened Module</option>
                    <option value="cases">Assigned Precinct Cases</option>
                    <option value="health">System Diagnostic Suite</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5 & 6: ACCOUNT READ-ONLY INFORMATION & RECENT ACTIVITY
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'profile' || activeSection === 'all') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Account Read-Only Information */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 shadow-sm space-y-4">
                <div className="border-b border-[#E7ECF3] pb-3">
                  <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Account Specifications &amp; Governance</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Employee ID</p>
                    <p className="font-mono font-black text-[#0F172A] mt-0.5">EMP-98214</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Badge Number</p>
                    <p className="font-mono font-black text-[#0F172A] mt-0.5">{profile.badgeNumber}</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Account Created</p>
                    <p className="font-black text-[#0F172A] mt-0.5">15 Jan 2019</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Account Status</p>
                    <p className="font-black text-emerald-600 mt-0.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      🟢 Online / Active
                    </p>
                  </div>
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Reporting Officer</p>
                    <p className="font-black text-[#0F172A] mt-0.5">DCP M. Gowda</p>
                  </div>
                  <div className="p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                    <p className="text-[10px] font-bold text-[#64748B] uppercase">Security Level</p>
                    <p className="font-black text-[#0B1F4D] mt-0.5">Level 4 — High Clearance</p>
                  </div>
                </div>
              </div>

              {/* Recent Security Activity Timeline */}
              <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 shadow-sm space-y-4">
                <div className="border-b border-[#E7ECF3] pb-3">
                  <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Recent Account Activity</h3>
                </div>

                <div className="space-y-3">
                  {[
                    { action: 'Profile Details Updated', time: 'Yesterday 04:20 PM', icon: User, color: 'text-sky-600 bg-sky-50' },
                    { action: 'Password Changed', time: '5 Days Ago', icon: Lock, color: 'text-amber-600 bg-amber-50' },
                    { action: 'Avatar Photo Updated', time: '2 Weeks Ago', icon: Camera, color: 'text-violet-600 bg-violet-50' },
                    { action: 'Multi-Factor Authentication Enabled', time: 'Last Month', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#F8F9FB] border border-[#E7ECF3] rounded-[14px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-[#0F172A]">{item.action}</p>
                          <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">{item.time}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 7: DANGER ZONE
             ══════════════════════════════════════════════════════════════════ */}
          {(activeSection === 'security' || activeSection === 'all') && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-rose-700 border-b border-rose-200 pb-4">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider">Danger Zone</h3>
                  <p className="text-xs font-semibold text-rose-600 mt-0.5">IRREVERSIBLE ACCOUNT ACTIONS — Require confirmation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDangerModalAction('deactivate')}
                  className="p-4 rounded-[18px] bg-white border border-rose-200 hover:bg-rose-500 hover:text-white transition-all text-left text-rose-700 cursor-pointer group shadow-xs"
                >
                  <p className="text-xs font-black group-hover:text-white">Deactivate Account</p>
                  <p className="text-[10px] font-semibold text-rose-600 group-hover:text-white/80 mt-1">Temporarily disable platform access and session tokens.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDangerModalAction('delete')}
                  className="p-4 rounded-[18px] bg-white border border-rose-200 hover:bg-rose-600 hover:text-white transition-all text-left text-rose-700 cursor-pointer group shadow-xs"
                >
                  <p className="text-xs font-black group-hover:text-white">Request Account Deletion</p>
                  <p className="text-[10px] font-semibold text-rose-600 group-hover:text-white/80 mt-1">Submit permanent account purge request to Headquarters IAM team.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDangerModalAction('logout_all')}
                  className="p-4 rounded-[18px] bg-white border border-rose-200 hover:bg-rose-500 hover:text-white transition-all text-left text-rose-700 cursor-pointer group shadow-xs"
                >
                  <p className="text-xs font-black group-hover:text-white">Sign Out From All Devices</p>
                  <p className="text-[10px] font-semibold text-rose-600 group-hover:text-white/80 mt-1">Revoke all active bearer tokens across web and mobile platforms.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDangerModalAction('reset_prefs')}
                  className="p-4 rounded-[18px] bg-white border border-rose-200 hover:bg-rose-500 hover:text-white transition-all text-left text-rose-700 cursor-pointer group shadow-xs"
                >
                  <p className="text-xs font-black group-hover:text-white">Reset All Preferences</p>
                  <p className="text-[10px] font-semibold text-rose-600 group-hover:text-white/80 mt-1">Restore all notification settings and UI preferences to defaults.</p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. INTERACTIVE IMAGE CROP & ADJUSTMENT MODAL ───────────────────── */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[26px] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0B1F4D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-[#C79A2B]" />
                <h3 className="text-sm font-black tracking-tight text-white">Crop Profile Photo</h3>
              </div>
              <button
                onClick={() => setCropModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Crop Canvas Preview Area */}
            <div className="p-6 bg-slate-900 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden border-4 border-[#C79A2B] shadow-inner bg-black flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
              </div>

              {/* Adjustments Controls */}
              <div className="w-full space-y-3 pt-2 text-white">
                {/* Zoom Slider */}
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="font-bold flex items-center gap-1.5"><ZoomOut className="w-3.5 h-3.5" /> Zoom</span>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-[#C79A2B] cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold w-10 text-right">{zoom.toFixed(1)}x</span>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center justify-between gap-3 text-xs pt-1">
                  <span className="font-bold">Rotation:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r - 90)}
                      className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> -90°
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => r + 90)}
                      className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> +90°
                    </button>
                    <button
                      type="button"
                      onClick={() => { setZoom(1); setRotation(0); }}
                      className="h-8 px-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#F8F9FB] border-t border-[#E7ECF3] flex items-center justify-between">
              <button
                onClick={() => setCropModalOpen(false)}
                className="h-9 px-5 rounded-full border border-[#E7ECF3] text-xs font-extrabold text-[#64748B] hover:bg-[#E7ECF3] cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={applyCroppedAvatar}
                className="h-9 px-6 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#0F2A6B] transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#C79A2B]" />
                Apply &amp; Save Avatar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DANGER ZONE CONFIRMATION MODAL ───────────────────────────── */}
      {dangerModalAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">Confirm Dangerous Action</h3>
                <p className="text-xs text-[#64748B]">Karnataka Police IAM Security Protocol</p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#64748B] leading-relaxed">
              Are you sure you want to proceed with{' '}
              <strong className="text-[#0F172A]">
                {dangerModalAction === 'deactivate' ? 'Account Deactivation' :
                 dangerModalAction === 'delete' ? 'Permanent Account Deletion' :
                 dangerModalAction === 'logout_all' ? 'Signing Out All Devices' :
                 'Resetting Preferences to Factory Defaults'}
              </strong>? This action will take effect immediately.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDangerModalAction(null)}
                className="h-9 px-4 rounded-full border border-[#E7ECF3] text-xs font-bold text-[#64748B] hover:bg-[#F8F9FB] cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDangerAction}
                className="h-9 px-5 rounded-full bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
