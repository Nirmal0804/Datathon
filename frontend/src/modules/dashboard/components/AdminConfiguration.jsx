import React, { useState } from 'react';
import {
  Settings, Save, Lock, Database, Server,
  UserCheck, CheckCircle, Clock, X,
  ChevronDown, Minus, Plus, Edit3
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { useTranslation } from '../../../i18n';

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Pill toggle: green when on, grey when off */
function Toggle({ checked, onChange, id, disabled }) {
  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-[#CBD5E1]'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

/** Setting row with label, description and a control on the right */
function SettingRow({ label, description, children, divider = true }) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 ${divider ? 'border-b border-[#E7ECF3] last:border-b-0' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-[#0F172A]">{label}</p>
        {description && <p className="text-[10px] font-semibold text-[#64748B] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Styled select dropdown */
function ConfigSelect({ value, onChange, options, id, disabled }) {
  return (
    <div className="relative">
      <select
        id={id}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none h-8 pl-3 pr-8 rounded-[10px] border border-[#E7ECF3] bg-[#F8F9FB] text-[11px] font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 cursor-pointer ${
          disabled ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        {options.map(({ value: v, label }) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748B] pointer-events-none" />
    </div>
  );
}

/** Numeric stepper */
function Stepper({ value, onChange, min = 1, max = 999, disabled }) {
  return (
    <div className={`flex items-center gap-1 border border-[#E7ECF3] rounded-[10px] bg-[#F8F9FB] overflow-hidden h-8 ${disabled ? 'opacity-60' : ''}`}>
      <button type="button" disabled={disabled} onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-full flex items-center justify-center hover:bg-[#E7ECF3] transition-colors cursor-pointer disabled:cursor-not-allowed">
        <Minus className="w-3 h-3 text-[#64748B]" />
      </button>
      <span className="w-8 text-center text-[11px] font-extrabold text-[#0F172A]">{value}</span>
      <button type="button" disabled={disabled} onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-full flex items-center justify-center hover:bg-[#E7ECF3] transition-colors cursor-pointer disabled:cursor-not-allowed">
        <Plus className="w-3 h-3 text-[#64748B]" />
      </button>
    </div>
  );
}

/** Range slider with value display */
function RangeSlider({ value, onChange, min = 10, max = 120, unit = 'min', disabled }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`flex items-center gap-3 w-48 ${disabled ? 'opacity-60' : ''}`}>
      <input
        type="range"
        disabled={disabled}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-1.5 appearance-none rounded-full bg-[#E7ECF3] cursor-pointer accent-[#0B1F4D] disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(to right, #0B1F4D ${pct}%, #E7ECF3 ${pct}%)` }}
      />
      <span className="text-[11px] font-extrabold text-[#0B1F4D] w-14 text-right">{value} {unit}</span>
    </div>
  );
}

/** Numeric input */
function NumInput({ value, onChange, id, suffix, disabled }) {
  return (
    <div className={`flex items-center gap-1.5 border border-[#E7ECF3] rounded-[10px] bg-[#F8F9FB] px-2.5 h-8 w-36 ${disabled ? 'opacity-60' : ''}`}>
      <input
        id={id}
        disabled={disabled}
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="flex-1 min-w-0 bg-transparent text-[11px] font-extrabold text-[#0F172A] focus:outline-none disabled:cursor-not-allowed"
      />
      {suffix && <span className="text-[10px] text-[#64748B] font-semibold shrink-0">{suffix}</span>}
    </div>
  );
}

/** Config card wrapper */
function ConfigCard({ icon: Icon, title, iconBg = 'bg-[#0B1F4D]', children }) {
  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] shadow-sm flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E7ECF3]">
        <div className={`w-9 h-9 rounded-[12px] ${iconBg} text-[#C79A2B] flex items-center justify-center shrink-0`}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
        <h3 className="text-sm font-black text-[#0F172A] tracking-tight">{title}</h3>
      </div>
      <div className="px-6 py-2 flex-1">{children}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AdminConfiguration() {
  const { t } = useTranslation();
  const { addToast } = useToast();

  /* ── Edit Mode state ── */
  const [isEditing, setIsEditing] = useState(false);

  /* ── Existing state preserved ── */
  const [config, setConfig] = useState({
    timeout: 30,
    rateLimit: 100,
    enforceMfa: true,
    maintenanceMode: false,
    backupCron: '0 0 * * *',
  });

  /* ── Extended UI state ── */
  const [sec, setSec] = useState({
    mfa: true,
    passwordPolicy: 'strong',
    passwordExpiry: '90',
    loginLimit: 5,
    autoLock: true,
  });

  const [session, setSession] = useState({
    timeout: 30,
    idleLogout: true,
    multiSession: false,
    deviceVerify: true,
    reauth: true,
  });

  const [api, setApi] = useState({
    rateLimit: 100,
    maxConcurrent: 500,
    logging: true,
    compression: false,
    internalOnly: true,
  });

  const [db, setDb] = useState({
    autoBackup: true,
    backupCron: '0 0 * * *',
    backupFreq: 'daily',
    retention: '30',
    disasterRecovery: false,
  });

  const [ops, setOps] = useState({
    maintenanceMode: false,
    readOnly: false,
    scheduledMaint: true,
    maintWindow: '2026-07-27T02:00',
    notifications: true,
  });

  const [saved, setSaved] = useState(true);

  const markDirty = () => {
    setSaved(false);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    // Sync extended state back to original config for backend compatibility
    setConfig(prev => ({
      ...prev,
      timeout: session.timeout,
      rateLimit: api.rateLimit,
      enforceMfa: sec.mfa,
      maintenanceMode: ops.maintenanceMode,
      backupCron: db.backupCron,
    }));
    setSaved(true);
    setIsEditing(false); // Disappear bottom action bar after saving
    addToast({
      title: 'Configuration Saved',
      message: 'System parameters have been committed and synced across precinct hubs.',
      type: 'success',
    });
  };

  const handleDiscard = () => {
    // Revert state
    setSec({ mfa: true, passwordPolicy: 'strong', passwordExpiry: '90', loginLimit: 5, autoLock: true });
    setSession({ timeout: config.timeout, idleLogout: true, multiSession: false, deviceVerify: true, reauth: true });
    setApi({ rateLimit: config.rateLimit, maxConcurrent: 500, logging: true, compression: false, internalOnly: true });
    setDb({ autoBackup: true, backupCron: config.backupCron, backupFreq: 'daily', retention: '30', disasterRecovery: false });
    setOps({ maintenanceMode: config.maintenanceMode, readOnly: false, scheduledMaint: true, maintWindow: '2026-07-27T02:00', notifications: true });
    setSaved(true);
    setIsEditing(false); // Disappear bottom action bar after discarding
    addToast({
      title: 'Changes Discarded',
      message: 'Reverted all unsaved configuration values.',
      type: 'info',
    });
  };

  // Helper to wrap setters with markDirty
  const s = (setter) => (val) => {
    setter(val);
    markDirty();
  };

  return (
    <div className={`w-full max-w-[1600px] mx-auto space-y-6 ${isEditing ? 'pb-28' : 'pb-12'}`}>

      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">{t('nav.settings', 'Platform System Configuration')}</h1>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              {t('admin.overviewSubtitle', 'Manage system parameters, access control protocols, database cron, and security policies.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${
            saved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {saved
              ? <><CheckCircle className="w-3.5 h-3.5" /> {t('admin.active', 'All Changes Synced')}</>
              : <><Clock className="w-3.5 h-3.5" /> {t('common.status', 'Unsaved Changes')}</>
            }
          </span>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="h-10 px-5 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#0F2A6B] transition-colors duration-150 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-[#C79A2B]" />
              {t('settings.title', 'Edit Configuration')}
            </button>
          ) : (
            <span className="bg-[#0B1F4D]/10 text-[#0B1F4D] border border-[#0B1F4D]/20 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0B1F4D] animate-pulse" />
              {t('admin.active', 'Editing Mode Active')}
            </span>
          )}
        </div>
      </div>

      {/* ── 5 Config Cards — 2-column responsive grid ────────────────────── */}
      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* ── Card 1: Security Access Control ── */}
          <ConfigCard icon={Lock} title={t('settings.security', 'Security Access Control')}>
            <SettingRow
              label={t('settings.mfa', 'MFA Authentication')}
              description="Require multi-factor authentication for all police personnel."
            >
              <Toggle checked={sec.mfa} onChange={s(v => setSec(p => ({ ...p, mfa: v })))} id="mfa" />
            </SettingRow>

            <SettingRow
              label={t('settings.changePassword', 'Password Policy')}
              description="Minimum complexity requirements for all system accounts."
            >
              <ConfigSelect
                value={sec.passwordPolicy}
                onChange={s(v => setSec(p => ({ ...p, passwordPolicy: v })))}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'strong',   label: 'Strong' },
                  { value: 'maximum',  label: 'Maximum Security' },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Password Expiry"
              description="Force password reset after the specified number of days."
            >
              <ConfigSelect
                value={sec.passwordExpiry}
                onChange={s(v => setSec(p => ({ ...p, passwordExpiry: v })))}
                options={[
                  { value: '30',    label: '30 Days' },
                  { value: '60',    label: '60 Days' },
                  { value: '90',    label: '90 Days' },
                  { value: 'never', label: 'Never'   },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Login Attempt Limit"
              description="Number of failed attempts before triggering account protection."
            >
              <Stepper
                value={sec.loginLimit}
                onChange={s(v => setSec(p => ({ ...p, loginLimit: v })))}
                min={1} max={10}
              />
            </SettingRow>

            <SettingRow
              label="Auto Account Lock"
              description="Automatically suspend users after repeated failed login attempts."
            >
              <Toggle checked={sec.autoLock} onChange={s(v => setSec(p => ({ ...p, autoLock: v })))} id="autoLock" />
            </SettingRow>
          </ConfigCard>

          {/* ── Card 2: Session & Authentication ── */}
          <ConfigCard icon={UserCheck} title="Session Management" iconBg="bg-[#1E40AF]">
            <SettingRow
              label="Automatic Session Timeout"
              description="Terminate idle sessions to protect sensitive police data."
            >
              <RangeSlider
                value={session.timeout}
                onChange={s(v => setSession(p => ({ ...p, timeout: v })))}
                min={10} max={120} unit="min"
              />
            </SettingRow>

            <SettingRow
              label="Idle Logout"
              description="Automatically sign out users with no activity for the timeout period."
            >
              <Toggle checked={session.idleLogout} onChange={s(v => setSession(p => ({ ...p, idleLogout: v })))} id="idleLogout" />
            </SettingRow>

            <SettingRow
              label="Allow Multiple Sessions"
              description="Permit the same user account to be logged in from several devices simultaneously."
            >
              <Toggle checked={session.multiSession} onChange={s(v => setSession(p => ({ ...p, multiSession: v })))} id="multiSession" />
            </SettingRow>

            <SettingRow
              label="Device Verification"
              description="Require device fingerprint verification on first login from a new device."
            >
              <Toggle checked={session.deviceVerify} onChange={s(v => setSession(p => ({ ...p, deviceVerify: v })))} id="deviceVerify" />
            </SettingRow>

            <SettingRow
              label="Force Re-authentication"
              description="Prompt for credentials again before performing sensitive operations."
            >
              <Toggle checked={session.reauth} onChange={s(v => setSession(p => ({ ...p, reauth: v })))} id="reauth" />
            </SettingRow>
          </ConfigCard>

          {/* ── Card 3: API & Network Controls ── */}
          <ConfigCard icon={Server} title="API & Network Controls" iconBg="bg-[#6D28D9]">
            <SettingRow
              label="API Rate Limit"
              description="Maximum number of API requests allowed per minute per client."
            >
              <NumInput
                id="rateLimit"
                value={api.rateLimit}
                onChange={s(v => setApi(p => ({ ...p, rateLimit: v })))}
                suffix="req/min"
              />
            </SettingRow>

            <SettingRow
              label="Max Concurrent Requests"
              description="Hard cap on simultaneous active API connections platform-wide."
            >
              <NumInput
                id="maxConcurrent"
                value={api.maxConcurrent}
                onChange={s(v => setApi(p => ({ ...p, maxConcurrent: v })))}
                suffix="conn"
              />
            </SettingRow>

            <SettingRow
              label="Enable API Logging"
              description="Record all API requests and responses to the audit log."
            >
              <Toggle checked={api.logging} onChange={s(v => setApi(p => ({ ...p, logging: v })))} id="apiLogging" />
            </SettingRow>

            <SettingRow
              label="Enable Request Compression"
              description="Compress API payloads to reduce bandwidth usage for field devices."
            >
              <Toggle checked={api.compression} onChange={s(v => setApi(p => ({ ...p, compression: v })))} id="apiComp" />
            </SettingRow>

            <SettingRow
              label="Internal Traffic Only"
              description="Restrict admin APIs to the Karnataka Police internal network exclusively."
            >
              <Toggle checked={api.internalOnly} onChange={s(v => setApi(p => ({ ...p, internalOnly: v })))} id="internalOnly" />
            </SettingRow>
          </ConfigCard>

          {/* ── Card 4: Database & Backup ── */}
          <ConfigCard icon={Database} title="Database Management" iconBg="bg-[#065F46]">
            <SettingRow
              label="Automatic Database Backups"
              description="Enable scheduled automated backups to the secure off-site repository."
            >
              <Toggle checked={db.autoBackup} onChange={s(v => setDb(p => ({ ...p, autoBackup: v })))} id="autoBackup" />
            </SettingRow>

            <SettingRow
              label="Backup Schedule (Cron)"
              description="Standard cron expression defining when backups are triggered."
            >
              <input
                type="text"
                value={db.backupCron}
                onChange={s(e => setDb(p => ({ ...p, backupCron: e.target.value })))}
                className="h-8 px-3 rounded-[10px] border border-[#E7ECF3] bg-[#F8F9FB] text-[11px] font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 w-36"
                placeholder="0 0 * * *"
              />
            </SettingRow>

            <SettingRow
              label="Backup Frequency"
              description="How often automated backups are created for this platform."
            >
              <ConfigSelect
                value={db.backupFreq}
                onChange={s(v => setDb(p => ({ ...p, backupFreq: v })))}
                options={[
                  { value: 'daily',   label: 'Daily'   },
                  { value: 'weekly',  label: 'Weekly'  },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Backup Retention"
              description="How long backup snapshots are kept before automatic deletion."
            >
              <ConfigSelect
                value={db.retention}
                onChange={s(v => setDb(p => ({ ...p, retention: v })))}
                options={[
                  { value: '7',  label: '7 Days'  },
                  { value: '15', label: '15 Days' },
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' },
                ]}
              />
            </SettingRow>

            <SettingRow
              label="Disaster Recovery Mode"
              description="Activate emergency recovery protocols and failover procedures."
            >
              <div className="flex items-center gap-2">
                <Toggle checked={db.disasterRecovery} onChange={s(v => setDb(p => ({ ...p, disasterRecovery: v })))} id="drMode" />
              </div>
            </SettingRow>

            {/* Last Backup Status badge */}
            <div className="pt-2 pb-1">
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-[10px] px-3 py-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-emerald-700">Last Backup: Successful</p>
                  <p className="text-[10px] font-semibold text-emerald-600">Today 02:00 AM · 2.4 GB</p>
                </div>
              </div>
            </div>
          </ConfigCard>

          {/* ── Card 5: Platform Maintenance — spans full width on xl ── */}
          <div className="xl:col-span-2">
            <ConfigCard icon={Settings} title="Platform Operations" iconBg="bg-[#92400E]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
                {/* Left column */}
                <div>
                  <SettingRow
                    label="Maintenance Mode"
                    description="Lock all non-administrator access while maintenance is active."
                  >
                    <Toggle checked={ops.maintenanceMode} onChange={s(v => setOps(p => ({ ...p, maintenanceMode: v })))} id="maintMode" />
                  </SettingRow>

                  <SettingRow
                    label="Read-only Emergency Mode"
                    description="Allow read-only access during incidents; block all write operations."
                  >
                    <Toggle checked={ops.readOnly} onChange={s(v => setOps(p => ({ ...p, readOnly: v })))} id="readOnly" />
                  </SettingRow>

                  <SettingRow
                    label="System Notifications"
                    description="Notify all connected users before maintenance begins."
                  >
                    <Toggle checked={ops.notifications} onChange={s(v => setOps(p => ({ ...p, notifications: v })))} id="sysNotif" />
                  </SettingRow>
                </div>

                {/* Right column */}
                <div>
                  <SettingRow
                    label="Enable Scheduled Maintenance"
                    description="Activate a recurring maintenance window at a fixed time."
                  >
                    <Toggle checked={ops.scheduledMaint} onChange={s(v => setOps(p => ({ ...p, scheduledMaint: v })))} id="schedMaint" />
                  </SettingRow>

                  <SettingRow
                    label="Maintenance Window"
                    description="Date and time when the next scheduled maintenance will begin."
                  >
                    <input
                      type="datetime-local"
                      value={ops.maintWindow}
                      onChange={s(e => setOps(p => ({ ...p, maintWindow: e.target.value })))}
                      className="h-8 px-3 rounded-[10px] border border-[#E7ECF3] bg-[#F8F9FB] text-[11px] font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20"
                    />
                  </SettingRow>
                </div>
              </div>
            </ConfigCard>
          </div>
        </div>

        {/* ── Sticky Action Bar — Only appears when isEditing is true ── */}
        {isEditing && (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7ECF3] shadow-lg animate-in slide-in-from-bottom-3 duration-200">
            <div className="max-w-[1600px] mx-auto px-8 py-3 flex items-center justify-between gap-4">
              {/* Left — status */}
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Configuration Status</p>
                <p className="text-xs font-extrabold text-[#0F172A] mt-0.5 flex items-center gap-1.5">
                  {saved
                    ? <><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> All Changes Synced · Ready to edit</>
                    : <><Clock className="w-3.5 h-3.5 text-amber-500" /> Unsaved Changes Pending</>
                  }
                </p>
              </div>

              {/* Right — actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDiscard}
                  className="h-9 px-5 rounded-full border border-[#E7ECF3] bg-white text-xs font-extrabold text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Discard Changes
                </button>
                <button
                  type="submit"
                  className="h-9 px-6 rounded-full bg-[#0B1F4D] text-white text-xs font-extrabold hover:bg-[#0F2A6B] transition-colors duration-150 cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
