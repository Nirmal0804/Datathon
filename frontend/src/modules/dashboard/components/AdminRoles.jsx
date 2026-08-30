import React, { useState, useMemo } from 'react';
import {
  Shield, Users, UserCheck, ShieldAlert, Plus, Copy, Download,
  Search, ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Clock,
  RefreshCw, Save, Send, Eye, Trash2, Key, Database, FileText, Map, Activity, Layers, Globe, Edit3, X, Code, Check, Lock, FileSpreadsheet
} from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { useTranslation } from '../../../i18n';

// ─── Initial Roles & Permissions Data ──────────────────────────────────────────
const INITIAL_ROLES = [
  {
    id: 'admin',
    name: 'System Administrator',
    badge: '👑',
    icon: Shield,
    desc: 'Full platform administration, security policies, user provisioning & system governance.',
    userCount: 24,
    level: 'Full Access',
    lastModified: '2 days ago',
    riskLevel: 'high',
    riskReason: 'Role has privileges to: Delete FIRs, Modify System Users, Purge Databases, Export Intelligence.',
    inheritance: ['System Administrator', 'Regional Admin', 'District Admin', 'Field Officer'],
  },
  {
    id: 'analyst',
    name: 'Intelligence Analyst',
    badge: '📊',
    icon: UserCheck,
    desc: 'Crime analytics, network graph analysis, predictive hotspot modeling & intelligence reports.',
    userCount: 81,
    level: 'Analytical Access',
    lastModified: '5 hours ago',
    riskLevel: 'medium',
    riskReason: 'Role has privileges to: Generate Intelligence Reports, Build Crime Graphs, Export Data.',
    inheritance: ['Intelligence Analyst', 'Senior Investigator', 'Field Officer'],
  },
  {
    id: 'officer',
    name: 'Field Officer',
    badge: '🚓',
    icon: Users,
    desc: 'Field FIR registration, patrol management, incident logging & real-time dispatch alerts.',
    userCount: 520,
    level: 'Operational Access',
    lastModified: 'Yesterday',
    riskLevel: 'low',
    riskReason: 'Standard field operational access. Cannot delete system logs, users, or databases.',
    inheritance: ['Field Officer', 'Patrol Supervisor'],
  },
];

const INITIAL_PERMISSIONS = {
  admin: {
    'GIS & Mapping': [
      { id: 'gis_read', label: 'Read Map Layer Data', granted: true, highRisk: false },
      { id: 'gis_edit', label: 'Edit Boundary & Zone Overlays', granted: true, highRisk: false },
      { id: 'gis_delete', label: 'Delete Custom GIS Layers', granted: true, highRisk: true },
      { id: 'gis_export', label: 'Export Spatial Data (GeoJSON)', granted: true, highRisk: false },
    ],
    'FIR Management': [
      { id: 'fir_create', label: 'Create FIR Records', granted: true, highRisk: false },
      { id: 'fir_edit', label: 'Edit FIR Content & Case Notes', granted: true, highRisk: false },
      { id: 'fir_view', label: 'View All Precinct FIR Records', granted: true, highRisk: false },
      { id: 'fir_close', label: 'Close & Archive FIR Cases', granted: true, highRisk: false },
      { id: 'fir_delete', label: 'Delete FIR Records', granted: true, highRisk: true },
    ],
    'Intelligence Reports': [
      { id: 'intel_view', label: 'View Classified Intelligence', granted: true, highRisk: false },
      { id: 'intel_generate', label: 'Generate Analytical Reports', granted: true, highRisk: false },
      { id: 'intel_export', label: 'Export PDF/CSV Reports', granted: true, highRisk: true },
      { id: 'intel_delete', label: 'Delete Intelligence Briefings', granted: true, highRisk: true },
    ],
    'Crime Network Analysis': [
      { id: 'net_view', label: 'View Gang & Network Graphs', granted: true, highRisk: false },
      { id: 'net_build', label: 'Build Link Analysis Graphs', granted: true, highRisk: false },
      { id: 'net_edit', label: 'Edit Suspect Linkage Data', granted: true, highRisk: false },
      { id: 'net_delete', label: 'Delete Crime Network Models', granted: true, highRisk: true },
    ],
    'User Administration': [
      { id: 'user_view', label: 'View System User Roster', granted: true, highRisk: false },
      { id: 'user_create', label: 'Create New Police Accounts', granted: true, highRisk: false },
      { id: 'user_suspend', label: 'Suspend / Deactivate Accounts', granted: true, highRisk: true },
      { id: 'user_reset', label: 'Reset User Passwords', granted: true, highRisk: false },
      { id: 'user_delete', label: 'Delete Accounts Permanently', granted: true, highRisk: true },
    ],
    'System Configuration': [
      { id: 'sys_read', label: 'Read System Parameters', granted: true, highRisk: false },
      { id: 'sys_modify', label: 'Modify Platform Settings', granted: true, highRisk: true },
      { id: 'sys_delete', label: 'Delete Security Policies', granted: true, highRisk: true },
    ],
    'Database Management': [
      { id: 'db_backup', label: 'Trigger On-Demand Backups', granted: true, highRisk: false },
      { id: 'db_restore', label: 'Restore Database Snapshots', granted: true, highRisk: true },
      { id: 'db_purge', label: 'Purge Historical Archives', granted: true, highRisk: true },
    ],
    'Audit Logs': [
      { id: 'audit_view', label: 'View System Audit Trail', granted: true, highRisk: false },
      { id: 'audit_export', label: 'Export Compliance Logs', granted: true, highRisk: false },
      { id: 'audit_delete', label: 'Clear System Activity Logs', granted: false, highRisk: true },
    ],
  },
  analyst: {
    'GIS & Mapping': [
      { id: 'gis_read', label: 'Read Map Layer Data', granted: true, highRisk: false },
      { id: 'gis_edit', label: 'Edit Boundary & Zone Overlays', granted: true, highRisk: false },
      { id: 'gis_delete', label: 'Delete Custom GIS Layers', granted: false, highRisk: true },
      { id: 'gis_export', label: 'Export Spatial Data (GeoJSON)', granted: true, highRisk: false },
    ],
    'FIR Management': [
      { id: 'fir_create', label: 'Create FIR Records', granted: false, highRisk: false },
      { id: 'fir_edit', label: 'Edit FIR Content & Case Notes', granted: false, highRisk: false },
      { id: 'fir_view', label: 'View All Precinct FIR Records', granted: true, highRisk: false },
      { id: 'fir_close', label: 'Close & Archive FIR Cases', granted: false, highRisk: false },
      { id: 'fir_delete', label: 'Delete FIR Records', granted: false, highRisk: true },
    ],
    'Intelligence Reports': [
      { id: 'intel_view', label: 'View Classified Intelligence', granted: true, highRisk: false },
      { id: 'intel_generate', label: 'Generate Analytical Reports', granted: true, highRisk: false },
      { id: 'intel_export', label: 'Export PDF/CSV Reports', granted: true, highRisk: true },
      { id: 'intel_delete', label: 'Delete Intelligence Briefings', granted: false, highRisk: true },
    ],
    'Crime Network Analysis': [
      { id: 'net_view', label: 'View Gang & Network Graphs', granted: true, highRisk: false },
      { id: 'net_build', label: 'Build Link Analysis Graphs', granted: true, highRisk: false },
      { id: 'net_edit', label: 'Edit Suspect Linkage Data', granted: true, highRisk: false },
      { id: 'net_delete', label: 'Delete Crime Network Models', granted: false, highRisk: true },
    ],
    'User Administration': [
      { id: 'user_view', label: 'View System User Roster', granted: true, highRisk: false },
      { id: 'user_create', label: 'Create New Police Accounts', granted: false, highRisk: false },
      { id: 'user_suspend', label: 'Suspend / Deactivate Accounts', granted: false, highRisk: true },
      { id: 'user_reset', label: 'Reset User Passwords', granted: false, highRisk: false },
      { id: 'user_delete', label: 'Delete Accounts Permanently', granted: false, highRisk: true },
    ],
    'System Configuration': [
      { id: 'sys_read', label: 'Read System Parameters', granted: true, highRisk: false },
      { id: 'sys_modify', label: 'Modify Platform Settings', granted: false, highRisk: true },
      { id: 'sys_delete', label: 'Delete Security Policies', granted: false, highRisk: true },
    ],
    'Database Management': [
      { id: 'db_backup', label: 'Trigger On-Demand Backups', granted: false, highRisk: false },
      { id: 'db_restore', label: 'Restore Database Snapshots', granted: false, highRisk: true },
      { id: 'db_purge', label: 'Purge Historical Archives', granted: false, highRisk: true },
    ],
    'Audit Logs': [
      { id: 'audit_view', label: 'View System Audit Trail', granted: true, highRisk: false },
      { id: 'audit_export', label: 'Export Compliance Logs', granted: true, highRisk: false },
      { id: 'audit_delete', label: 'Clear System Activity Logs', granted: false, highRisk: true },
    ],
  },
  officer: {
    'GIS & Mapping': [
      { id: 'gis_read', label: 'Read Map Layer Data', granted: true, highRisk: false },
      { id: 'gis_edit', label: 'Edit Boundary & Zone Overlays', granted: false, highRisk: false },
      { id: 'gis_delete', label: 'Delete Custom GIS Layers', granted: false, highRisk: true },
      { id: 'gis_export', label: 'Export Spatial Data (GeoJSON)', granted: false, highRisk: false },
    ],
    'FIR Management': [
      { id: 'fir_create', label: 'Create FIR Records', granted: true, highRisk: false },
      { id: 'fir_edit', label: 'Edit FIR Content & Case Notes', granted: true, highRisk: false },
      { id: 'fir_view', label: 'View All Precinct FIR Records', granted: true, highRisk: false },
      { id: 'fir_close', label: 'Close & Archive FIR Cases', granted: true, highRisk: false },
      { id: 'fir_delete', label: 'Delete FIR Records', granted: false, highRisk: true },
    ],
    'Intelligence Reports': [
      { id: 'intel_view', label: 'View Classified Intelligence', granted: false, highRisk: false },
      { id: 'intel_generate', label: 'Generate Analytical Reports', granted: false, highRisk: false },
      { id: 'intel_export', label: 'Export PDF/CSV Reports', granted: false, highRisk: true },
      { id: 'intel_delete', label: 'Delete Intelligence Briefings', granted: false, highRisk: true },
    ],
    'Crime Network Analysis': [
      { id: 'net_view', label: 'View Gang & Network Graphs', granted: false, highRisk: false },
      { id: 'net_build', label: 'Build Link Analysis Graphs', granted: false, highRisk: false },
      { id: 'net_edit', label: 'Edit Suspect Linkage Data', granted: false, highRisk: false },
      { id: 'net_delete', label: 'Delete Crime Network Models', granted: false, highRisk: true },
    ],
    'User Administration': [
      { id: 'user_view', label: 'View System User Roster', granted: true, highRisk: false },
      { id: 'user_create', label: 'Create New Police Accounts', granted: false, highRisk: false },
      { id: 'user_suspend', label: 'Suspend / Deactivate Accounts', granted: false, highRisk: true },
      { id: 'user_reset', label: 'Reset User Passwords', granted: false, highRisk: false },
      { id: 'user_delete', label: 'Delete Accounts Permanently', granted: false, highRisk: true },
    ],
    'System Configuration': [
      { id: 'sys_read', label: 'Read System Parameters', granted: false, highRisk: false },
      { id: 'sys_modify', label: 'Modify Platform Settings', granted: false, highRisk: true },
      { id: 'sys_delete', label: 'Delete Security Policies', granted: false, highRisk: true },
    ],
    'Database Management': [
      { id: 'db_backup', label: 'Trigger On-Demand Backups', granted: false, highRisk: false },
      { id: 'db_restore', label: 'Restore Database Snapshots', granted: false, highRisk: true },
      { id: 'db_purge', label: 'Purge Historical Archives', granted: false, highRisk: true },
    ],
    'Audit Logs': [
      { id: 'audit_view', label: 'View System Audit Trail', granted: false, highRisk: false },
      { id: 'audit_export', label: 'Export Compliance Logs', granted: false, highRisk: false },
      { id: 'audit_delete', label: 'Clear System Activity Logs', granted: false, highRisk: true },
    ],
  },
};

const INITIAL_TIMELINE = [
  { time: 'Today 09:20 AM', user: 'Admin S. Kumar', action: 'Granted "Export Intelligence PDF"', type: 'grant' },
  { time: 'Yesterday 04:15 PM', user: 'Admin R. Rao', action: 'Removed "Delete Database Snapshots"', type: 'revoke' },
  { time: 'Yesterday 11:30 AM', user: 'Admin S. Kumar', action: 'Enabled "Audit Export" for Intelligence Analyst', type: 'grant' },
  { time: '23 Jul 02:45 PM', user: 'SuperAdmin', action: 'Updated System Administrator role hierarchy', type: 'system' },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────────

/** Modern Toggle Switch Component */
function ModernToggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-[#CBD5E1]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function AdminRoles() {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);

  // Selected role
  const [selectedRoleId, setSelectedRoleId] = useState('admin');

  // Working state for permissions
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);

  // Unsaved changes tracker
  const [unsavedCount, setUnsavedCount] = useState(0);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Expanded groups state
  const [expandedGroups, setExpandedGroups] = useState({
    'GIS & Mapping': true,
    'FIR Management': true,
    'Intelligence Reports': true,
    'Crime Network Analysis': true,
    'User Administration': true,
    'System Configuration': true,
    'Database Management': true,
    'Audit Logs': true,
  });

  // Risk confirmation modal state
  const [pendingHighRiskAction, setPendingHighRiskAction] = useState(null);

  // Delete role confirmation modal state
  const [pendingDeleteRole, setPendingDeleteRole] = useState(null);

  // Preview Access Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewTab, setPreviewTab] = useState('effective'); // 'effective' | 'ui' | 'jwt'

  // Export Matrix Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  // Timeline list
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);

  // Roles list
  const [roles, setRoles] = useState(INITIAL_ROLES);

  // Selected Role Object
  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || roles[0],
    [roles, selectedRoleId]
  );

  // Permissions for current selected role
  const currentRolePerms = permissions[selectedRoleId] || {};

  // Toggle group accordion
  const toggleGroupExpand = (groupName) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Toggle an individual permission
  const handleTogglePermission = (groupName, item, newValue) => {
    if (item.highRisk && newValue === true) {
      setPendingHighRiskAction({ groupName, item, newValue });
      return;
    }
    applyPermissionChange(groupName, item.id, newValue);
  };

  const applyPermissionChange = (groupName, itemId, newValue) => {
    setPermissions((prev) => {
      const rolePerms = { ...prev[selectedRoleId] };
      const groupItems = (rolePerms[groupName] || []).map((perm) =>
        perm.id === itemId ? { ...perm, granted: newValue } : perm
      );
      return {
        ...prev,
        [selectedRoleId]: {
          ...rolePerms,
          [groupName]: groupItems,
        },
      };
    });
    setIsEditing(true); // Show bottom bar when editing
    setUnsavedCount((c) => c + 1);
  };

  const confirmHighRiskAction = () => {
    if (pendingHighRiskAction) {
      const { groupName, item, newValue } = pendingHighRiskAction;
      applyPermissionChange(groupName, item.id, newValue);
      addToast({
        title: 'High-Risk Privilege Warning',
        message: `High-risk privilege "${item.label}" was set to ${newValue ? 'ENABLED' : 'DISABLED'}.`,
        type: 'warning',
      });
      setPendingHighRiskAction(null);
    }
  };

  // Delete Role Handler
  const confirmDeleteRole = () => {
    if (!pendingDeleteRole) return;
    if (roles.length <= 1) {
      addToast({
        title: 'Cannot Delete Role',
        message: 'At least one system role must remain in the RBAC matrix.',
        type: 'danger',
      });
      setPendingDeleteRole(null);
      return;
    }

    const roleIdToDelete = pendingDeleteRole.id;
    const roleNameToDelete = pendingDeleteRole.name;

    const updatedRoles = roles.filter((r) => r.id !== roleIdToDelete);
    setRoles(updatedRoles);

    setPermissions((prev) => {
      const next = { ...prev };
      delete next[roleIdToDelete];
      return next;
    });

    if (selectedRoleId === roleIdToDelete) {
      setSelectedRoleId(updatedRoles[0].id);
    }

    setPendingDeleteRole(null);
    addToast({
      title: 'Role Deleted',
      message: `Role "${roleNameToDelete}" has been removed from the RBAC engine.`,
      type: 'info',
    });
  };

  // KPI Statistics for the selected role
  const kpiStats = useMemo(() => {
    let granted = 0;
    let restricted = 0;
    let highRiskGranted = 0;

    Object.values(currentRolePerms).forEach((items) => {
      items.forEach((item) => {
        if (item.granted) {
          granted++;
          if (item.highRisk) highRiskGranted++;
        } else {
          restricted++;
        }
      });
    });

    return {
      granted,
      restricted,
      highRiskGranted,
      assignedUsers: selectedRole ? selectedRole.userCount : 0,
    };
  }, [currentRolePerms, selectedRole]);

  // Simulated Scope List for JWT Tab
  const grantedScopeList = useMemo(() => {
    const scopes = [];
    Object.values(currentRolePerms).forEach((items) => {
      items.forEach((item) => {
        if (item.granted) scopes.push(item.id);
      });
    });
    return scopes;
  }, [currentRolePerms]);

  // Filtered permission groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return currentRolePerms;
    const query = searchQuery.toLowerCase();
    const result = {};

    Object.entries(currentRolePerms).forEach(([groupName, items]) => {
      const matchesGroup = groupName.toLowerCase().includes(query);
      const matchingItems = items.filter(
        (item) => matchesGroup || item.label.toLowerCase().includes(query)
      );
      if (matchingItems.length > 0) {
        result[groupName] = matchingItems;
      }
    });

    return result;
  }, [currentRolePerms, searchQuery]);

  // Actions
  const handleSave = (e) => {
    if (e) e.preventDefault();
    setUnsavedCount(0);
    setIsEditing(false); // Hide bottom action bar after saving
    setTimeline((prev) => [
      {
        time: 'Just now',
        user: 'Administrator',
        action: `Published updated permissions for ${selectedRole?.name || 'Selected Role'}`,
        type: 'grant',
      },
      ...prev,
    ]);
    addToast({
      title: 'Permissions Published',
      message: `Role-based access control matrix updated for "${selectedRole?.name || 'Selected Role'}".`,
      type: 'success',
    });
  };

  const handleReset = () => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRoleId]: INITIAL_PERMISSIONS[selectedRoleId] || prev[selectedRoleId],
    }));
    setUnsavedCount(0);
    setIsEditing(false); // Hide bottom action bar after resetting
    addToast({
      title: 'Changes Reset',
      message: `Reverted unsaved modifications for ${selectedRole?.name || 'Selected Role'}.`,
      type: 'info',
    });
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  // Generate CSV data for matrix download
  const generateCSVMatrix = () => {
    const roleNames = roles.map((r) => r.name);
    const header = ['"Module Group"', '"Permission Name"', '"High Risk"', ...roleNames.map((n) => `"${n}"`)].join(',');

    const rows = [];
    const samplePerms = permissions[roles[0]?.id] || {};

    Object.entries(samplePerms).forEach(([groupName, items]) => {
      items.forEach((item) => {
        const row = [
          `"${groupName}"`,
          `"${item.label}"`,
          item.highRisk ? '"YES"' : '"NO"',
        ];

        roles.forEach((r) => {
          const rolePermGroup = permissions[r.id]?.[groupName] || [];
          const match = rolePermGroup.find((p) => p.id === item.id);
          row.push(match?.granted ? '"GRANTED"' : '"RESTRICTED"');
        });

        rows.push(row.join(','));
      });
    });

    return [header, ...rows].join('\n');
  };

  // Download CSV File
  const handleDownloadCSV = () => {
    const csvData = generateCSVMatrix();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_RBAC_Permission_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'CSV Matrix Downloaded',
      message: 'File saved as KSP_RBAC_Permission_Matrix.csv',
      type: 'success',
    });
    setShowExportModal(false);
  };

  // Download JSON File
  const handleDownloadJSON = () => {
    const exportPayload = {
      generatedAt: new Date().toISOString(),
      platform: 'Karnataka Police Intelligence Platform',
      version: '2.4.0',
      totalRoles: roles.length,
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        level: r.level,
        riskLevel: r.riskLevel,
        userCount: r.userCount,
        permissions: permissions[r.id] || {},
      })),
    };

    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KSP_RBAC_Permission_Matrix_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'JSON Specification Downloaded',
      message: 'File saved as KSP_RBAC_Permission_Matrix.json',
      type: 'success',
    });
    setShowExportModal(false);
  };

  const handleCloneRole = () => {
    const newId = `clone_${Date.now()}`;
    const newRole = {
      ...selectedRole,
      id: newId,
      name: `${selectedRole.name} (Copy)`,
      userCount: 0,
      lastModified: 'Just now',
    };
    setRoles((r) => [...r, newRole]);
    setPermissions((p) => ({
      ...p,
      [newId]: JSON.parse(JSON.stringify(currentRolePerms)),
    }));
    setSelectedRoleId(newId);
    addToast({
      title: 'Role Cloned',
      message: `Created duplicate role "${newRole.name}".`,
      type: 'success',
    });
  };

  const handleCreateRole = () => {
    const newId = `custom_${Date.now()}`;
    const newRole = {
      id: newId,
      name: 'Custom Police Role',
      badge: '🛡️',
      icon: Shield,
      desc: 'Custom operational role with tailored security privileges.',
      userCount: 0,
      level: 'Custom Access',
      lastModified: 'Just now',
      riskLevel: 'low',
      riskReason: 'New role with baseline read-only access.',
      inheritance: ['Custom Police Role', 'Field Officer'],
    };
    setRoles((r) => [...r, newRole]);
    setPermissions((p) => ({
      ...p,
      [newId]: JSON.parse(JSON.stringify(INITIAL_PERMISSIONS.officer)),
    }));
    setSelectedRoleId(newId);
    addToast({
      title: 'New Role Created',
      message: 'Initial permissions initialized. Adjust privileges below.',
      type: 'success',
    });
  };

  return (
    <div className={`w-full max-w-[1600px] mx-auto space-y-6 ${isEditing ? 'pb-28' : 'pb-12'}`}>
      {/* ── 1. Hero Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[88px]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">{t('admin.roleManagement', 'Privileges & Role Management')}</h1>
              <span className="bg-[#F8F9FB] text-[#0B1F4D] border border-[#E7ECF3] px-3 py-0.5 rounded-full font-extrabold text-xs">
                {roles.length} {t('admin.roles', 'Configured Roles')}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              {t('admin.overviewSubtitle', 'Configure role-based access control (RBAC), permission groups, and operational privileges.')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="h-10 px-5 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#0F2A6B] transition-colors duration-150 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-[#C79A2B]" />
              {t('admin.editRole', 'Edit Privileges')}
            </button>
          ) : (
            <span className="bg-[#0B1F4D]/10 text-[#0B1F4D] border border-[#0B1F4D]/20 px-3.5 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0B1F4D] animate-pulse" />
              {t('admin.active', 'Editing Mode Active')}
            </span>
          )}

          <button
            onClick={handleCreateRole}
            className="h-10 px-5 rounded-full border border-[#E7ECF3] bg-white text-[#0B1F4D] font-extrabold text-xs hover:bg-[#F8F9FB] transition-colors duration-150 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('admin.createRole', 'Create New Role')}
          </button>

          <button
            onClick={handleCloneRole}
            className="h-10 px-5 rounded-full border border-[#E7ECF3] bg-white text-[#0B1F4D] font-extrabold text-xs hover:bg-[#F8F9FB] transition-colors duration-150 flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            {t('admin.cloneRole', 'Clone Role')}
          </button>

          <button
            onClick={handleExport}
            className="h-10 px-5 rounded-full border border-[#E7ECF3] bg-white text-[#0B1F4D] font-extrabold text-xs hover:bg-[#F8F9FB] transition-colors duration-150 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0B1F4D]" />
            {t('reports.exportCSV', 'Export Matrix')}
          </button>
        </div>
      </div>

      {/* ── 2. SECTION 1 — Role Cards Grid (3 Columns) ────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">{t('admin.roles', 'Select System Role')}</h2>
          <span className="text-xs font-semibold text-[#64748B]">{roles.length} {t('admin.roles', 'Roles Configured')}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => {
            const isSelected = r.id === selectedRoleId;
            const Icon = r.icon || Shield;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedRoleId(r.id)}
                className={`relative bg-white rounded-[22px] p-6 cursor-pointer border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#0B1F4D] ring-2 ring-[#0B1F4D]/20 bg-[#F4F7FF]'
                    : 'border-[#E7ECF3] hover:border-[#0B1F4D]/30 hover:shadow-md'
                }`}
              >
                {/* Header inside card */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center text-lg shrink-0 ${
                        isSelected ? 'bg-[#0B1F4D] text-[#C79A2B]' : 'bg-[#0B1F4D]/5 text-[#0B1F4D]'
                      }`}>
                        {r.badge || <Icon className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#0F172A]">
                          {r.id === 'admin' ? t('auth.roleAdmin', 'System Administrator') : r.id === 'analyst' ? t('auth.roleAnalyst', 'Intelligence Analyst') : r.id === 'officer' ? t('auth.roleFieldOfficer', 'Field Officer') : r.name}
                        </h3>
                        <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">{r.level}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="bg-[#0B1F4D] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3 h-3 text-[#C79A2B]" />
                        {t('admin.active', 'Editing')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-[#64748B] mb-4 leading-relaxed">
                    {r.desc}
                  </p>
                </div>

                {/* Footer specs inside card */}
                <div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E7ECF3] mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{t('admin.activeUsers', 'Active Users')}</p>
                      <p className="text-xs font-black text-[#0F172A]">{r.userCount} {t('cases.officer', 'personnel')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{t('common.date', 'Last Modified')}</p>
                      <p className="text-xs font-black text-[#0F172A]">{r.lastModified}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoleId(r.id);
                      }}
                      className={`flex-1 h-9 rounded-full font-extrabold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0B1F4D] text-white shadow-sm'
                          : 'bg-[#F8F9FB] border border-[#E7ECF3] text-[#0B1F4D] hover:bg-[#0B1F4D] hover:text-white'
                      }`}
                    >
                      {isSelected ? t('admin.selected', 'Currently Selected') : t('admin.managePermissions', 'Manage Permissions')}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteRole(r);
                      }}
                      title={t('admin.deleteRole', 'Delete Role')}
                      className="w-9 h-9 rounded-full border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors duration-150 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. SECTION 2 — Selected Role Configuration ────────────────────── */}
      {selectedRole && (
        <div className="bg-white border border-[#E7ECF3] rounded-[26px] p-6 lg:p-8 shadow-sm space-y-6">

          {/* Section Title & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7ECF3] pb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedRole.badge}</span>
                <h2 className="text-lg font-black text-[#0F172A] tracking-tight">
                  {selectedRole.name} — {t('admin.rolePermissions', 'Permission Configuration')}
                </h2>
              </div>
              <p className="text-xs font-semibold text-[#64748B] mt-1">
                {t('admin.overviewSubtitle', 'Modify fine-grained operational access control lists (ACL) for this security group.')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                selectedRole.riskLevel === 'high'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : selectedRole.riskLevel === 'medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {selectedRole.riskLevel === 'high' ? `🔴 ${t('common.critical', 'High Risk Role')}` : selectedRole.riskLevel === 'medium' ? `🟡 ${t('common.medium', 'Medium Risk Role')}` : `🟢 ${t('common.low', 'Low Risk Role')}`}
              </span>

              <button
                type="button"
                onClick={() => setPendingDeleteRole(selectedRole)}
                className="h-8 px-3 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-xs font-extrabold hover:bg-rose-600 hover:text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('admin.deleteRole', 'Delete Role')}
              </button>
            </div>
          </div>

          {/* ── 3A. Summary KPI Cards ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 text-center">
              <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">{t('admin.grantedPermissions', 'Granted Permissions')}</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{kpiStats.granted}</p>
            </div>

            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 text-center">
              <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">{t('admin.restrictedPermissions', 'Restricted Permissions')}</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{kpiStats.restricted}</p>
            </div>

            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 text-center">
              <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">{t('admin.highRiskPrivileges', 'High-Risk Privileges')}</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{kpiStats.highRiskGranted}</p>
            </div>

            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 text-center">
              <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">{t('admin.assignedPersonnel', 'Assigned Personnel')}</p>
              <p className="text-2xl font-black text-[#0B1F4D] mt-1">{kpiStats.assignedUsers}</p>
            </div>
          </div>

          {/* ── 3B. Risk Indicator & Inheritance Grid ────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Risk Panel */}
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[20px] p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{t('admin.securityRiskAssessment', 'Security Risk Assessment')}</h4>
                <p className="text-xs font-bold text-[#0F172A] mt-1">
                  {selectedRole.riskLevel === 'high' ? t('common.critical', 'High Privilege Exposure') : t('common.status', 'Operational Scope Assessment')}
                </p>
                <p className="text-xs font-medium text-[#64748B] mt-1 leading-relaxed">
                  {selectedRole.riskReason}
                </p>
              </div>
            </div>

            {/* Inheritance Panel */}
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[20px] p-5">
              <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-3">{t('admin.permissionHierarchy', 'Permission Hierarchy & Inheritance')}</h4>
              <div className="flex flex-wrap items-center gap-2">
                {(selectedRole.inheritance || []).map((roleName, idx) => (
                  <React.Fragment key={roleName}>
                    <span className="bg-white border border-[#E7ECF3] px-3 py-1 rounded-full text-xs font-extrabold text-[#0B1F4D] shadow-2xs">
                      {roleName}
                    </span>
                    {idx < (selectedRole.inheritance || []).length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[#64748B]" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* ── 3C. Quick Permission Search Bar ───────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('dashboard.searchPlaceholder', 'Search permissions (e.g. backup, delete, FIR)...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-[#E7ECF3] bg-[#F8F9FB] text-xs font-bold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0B1F4D]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
                >
                  {t('dashboard.clearFilters', 'Clear')}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const next = {};
                  Object.keys(currentRolePerms).forEach((k) => (next[k] = true));
                  setExpandedGroups(next);
                }}
                className="text-xs font-extrabold text-[#0B1F4D] hover:underline cursor-pointer"
              >
                {t('admin.expandAll', 'Expand All')}
              </button>
              <span className="text-[#E7ECF3]">|</span>
              <button
                onClick={() => {
                  const next = {};
                  Object.keys(currentRolePerms).forEach((k) => (next[k] = false));
                  setExpandedGroups(next);
                }}
                className="text-xs font-extrabold text-[#64748B] hover:underline cursor-pointer"
              >
                {t('admin.collapseAll', 'Collapse All')}
              </button>
            </div>
          </div>

          {/* ── 3D. Collapsible Permission Groups ─────────────────────────────── */}
          <div className="space-y-4 pt-2">
            {Object.keys(filteredGroups).length === 0 ? (
              <div className="text-center py-10 bg-[#F8F9FB] rounded-[20px] border border-dashed border-[#E7ECF3]">
                <Search className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-extrabold text-[#0F172A]">No permissions match "{searchQuery}"</p>
                <p className="text-xs text-[#64748B] mt-1">Try searching for generic actions like "export", "read", or "delete".</p>
              </div>
            ) : (
              Object.entries(filteredGroups).map(([groupName, items]) => {
                const isExpanded = expandedGroups[groupName] !== false;
                const activeCount = items.filter((i) => i.granted).length;

                return (
                  <div
                    key={groupName}
                    className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[20px] overflow-hidden transition-all duration-150"
                  >
                    {/* Group Header */}
                    <div
                      onClick={() => toggleGroupExpand(groupName)}
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-[#E7ECF3]/40 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[10px] bg-[#0B1F4D]/5 border border-[#0B1F4D]/10 flex items-center justify-center text-[#0B1F4D] font-bold text-xs">
                          {groupName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{groupName}</h3>
                          <p className="text-[10px] font-semibold text-[#64748B]">
                            {activeCount} of {items.length} privileges enabled
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          activeCount === items.length
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : activeCount > 0
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {activeCount === items.length ? 'Full Access' : activeCount > 0 ? 'Partial' : 'Disabled'}
                        </span>

                        <div className="w-7 h-7 rounded-full bg-white border border-[#E7ECF3] flex items-center justify-center text-[#0B1F4D]">
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                    </div>

                    {/* Group Rows */}
                    {isExpanded && (
                      <div className="divide-y divide-[#E7ECF3] bg-white border-t border-[#E7ECF3]">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="px-6 py-3.5 flex items-center justify-between hover:bg-[#F8F9FB] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-[#0F172A]">{item.label}</span>
                              {item.highRisk && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
                                  High Risk
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-[11px] font-extrabold ${item.granted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {item.granted ? 'Granted' : 'Restricted'}
                              </span>
                              <ModernToggle
                                checked={item.granted}
                                onChange={(newVal) => handleTogglePermission(groupName, item, newVal)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── 3E. Recent Permission Changes Activity Timeline ────────────────── */}
          <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[20px] p-5 pt-4">
            <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider mb-4">Recent Audit Activity &amp; Privilege History</h4>
            <div className="space-y-3">
              {timeline.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-[#E7ECF3] rounded-[14px]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${
                      entry.type === 'grant' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#0F172A]">{entry.action}</p>
                      <p className="text-[10px] font-semibold text-[#64748B] mt-0.5">Executed by {entry.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#64748B] bg-[#F8F9FB] px-2.5 py-1 rounded-full border border-[#E7ECF3]">
                    {entry.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. STICKY BOTTOM ACTION BAR — Only appears when isEditing is true ── */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7ECF3] shadow-lg animate-in slide-in-from-bottom-3 duration-200">
          <div className="max-w-[1600px] mx-auto px-8 py-3 flex items-center justify-between gap-4">
            {/* Left status indicator */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${unsavedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div>
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">RBAC Sync Status</p>
                <p className="text-xs font-extrabold text-[#0F172A] mt-0.5 flex items-center gap-1.5">
                  {unsavedCount > 0 ? (
                    <span className="text-amber-600">{unsavedCount} Unsaved Privilege Change{unsavedCount > 1 ? 's' : ''}</span>
                  ) : (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      All Privilege Matrix Changes Synced
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="h-9 px-4 rounded-full border border-[#E7ECF3] bg-white text-xs font-extrabold text-[#64748B] hover:bg-[#F8F9FB] hover:text-[#0F172A] transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="h-9 px-4 rounded-full border border-[#0B1F4D]/20 bg-white text-xs font-extrabold text-[#0B1F4D] hover:bg-[#0B1F4D]/5 transition-colors duration-150 cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Access
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="h-9 px-6 rounded-full bg-[#0B1F4D] text-white text-xs font-extrabold hover:bg-[#0F2A6B] transition-colors duration-150 cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                Publish Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. High Risk Modal Confirmation ───────────────────────────────── */}
      {pendingHighRiskAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">High-Risk Privilege Warning</h3>
                <p className="text-xs text-[#64748B]">Security Escalation Notice</p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#64748B] leading-relaxed">
              You are enabling <strong className="text-[#0F172A]">"{pendingHighRiskAction.item.label}"</strong> for the role <strong className="text-[#0F172A]">{selectedRole?.name}</strong>. This allows sensitive operations that impact data integrity.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingHighRiskAction(null)}
                className="h-9 px-4 rounded-full border border-[#E7ECF3] text-xs font-bold text-[#64748B] hover:bg-[#F8F9FB]"
              >
                Cancel
              </button>
              <button
                onClick={confirmHighRiskAction}
                className="h-9 px-5 rounded-full bg-amber-500 text-white text-xs font-extrabold hover:bg-amber-600 shadow-sm"
              >
                Confirm Privilege
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. Delete Role Confirmation Modal ──────────────────────────────── */}
      {pendingDeleteRole && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[24px] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">Confirm Role Deletion</h3>
                <p className="text-xs text-[#64748B]">RBAC Governance Action</p>
              </div>
            </div>

            <p className="text-xs font-medium text-[#64748B] leading-relaxed">
              Are you sure you want to delete the role <strong className="text-[#0F172A]">"{pendingDeleteRole.name}"</strong>? All associated permission mappings will be removed permanently from the system.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingDeleteRole(null)}
                className="h-9 px-4 rounded-full border border-[#E7ECF3] text-xs font-bold text-[#64748B] hover:bg-[#F8F9FB] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRole}
                className="h-9 px-5 rounded-full bg-rose-600 text-white text-xs font-extrabold hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. PREVIEW ACCESS MODAL ───────────────────────────────────────── */}
      {showPreviewModal && selectedRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[26px] max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 bg-[#0B1F4D] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#C79A2B]/20 border border-[#C79A2B]/40 text-[#C79A2B] flex items-center justify-center text-xl shrink-0">
                  {selectedRole.badge || '🛡️'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black tracking-tight text-white">
                      Role Access Preview — {selectedRole.name}
                    </h3>
                    <span className="bg-[#C79A2B] text-[#0B1F4D] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                      {selectedRole.level}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 mt-0.5">
                    Real-time simulation of operational permissions, UI scope &amp; authorization token for {selectedRole.userCount} assigned personnel.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 py-3 bg-[#F8F9FB] border-b border-[#E7ECF3]">
              {[
                { id: 'effective', label: 'Effective Access Matrix', icon: Eye },
                { id: 'ui', label: 'UI Capability Scope', icon: Layers },
                { id: 'jwt', label: 'Simulated Bearer Token (JWT)', icon: Code },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPreviewTab(id)}
                  className={`h-8 px-4 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                    previewTab === id
                      ? 'bg-[#0B1F4D] text-white shadow-xs'
                      : 'bg-white border border-[#E7ECF3] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E7ECF3]/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* TAB 1: EFFECTIVE ACCESS MATRIX */}
              {previewTab === 'effective' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-[#F8F9FB] border border-[#E7ECF3] p-4 rounded-[16px]">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-[#0F172A]">
                        Total Capabilities: <span className="font-extrabold text-[#0B1F4D]">{kpiStats.granted + kpiStats.restricted}</span>
                      </span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Allowed: {kpiStats.granted}
                      </span>
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Denied: {kpiStats.restricted}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      Simulation Mode: Active Policy
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentRolePerms).map(([groupName, items]) => {
                      const safeItems = Array.isArray(items) ? items : [];
                      return (
                        <div key={groupName} className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 space-y-2.5">
                          <div className="flex items-center justify-between border-b border-[#E7ECF3] pb-2">
                            <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{groupName}</h4>
                            <span className="text-[10px] font-extrabold text-[#64748B]">
                              {safeItems.filter(i => i?.granted).length}/{safeItems.length} Active
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {safeItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-[8px] bg-white border border-[#E7ECF3]/60">
                              <span className="font-bold text-[#0F172A] flex items-center gap-1.5">
                                {item.label}
                                {item.highRisk && (
                                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    High Risk
                                  </span>
                                )}
                              </span>

                              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                item.granted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                                {item.granted ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-rose-600" />}
                                {item.granted ? 'ALLOWED' : 'DENIED'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* TAB 2: UI CAPABILITY SCOPE */}
              {previewTab === 'ui' && (
                <div className="space-y-5">
                  <div className="bg-[#F8F9FB] border border-[#E7ECF3] p-4 rounded-[18px] space-y-3">
                    <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Dashboard Module Visibility Simulation</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { module: 'Overview Dashboard', visible: true },
                        { module: 'FIR Management', visible: currentRolePerms['FIR Management']?.some(i => i.id === 'fir_view' && i.granted) },
                        { module: 'Hotspot Detection', visible: currentRolePerms['GIS & Mapping']?.some(i => i.id === 'gis_read' && i.granted) },
                        { module: 'Users Control', visible: currentRolePerms['User Administration']?.some(i => i.id === 'user_view' && i.granted) },
                        { module: 'System Health', visible: currentRolePerms['System Configuration']?.some(i => i.id === 'sys_read' && i.granted) },
                        { module: 'System Audit Logs', visible: currentRolePerms['Audit Logs']?.some(i => i.id === 'audit_view' && i.granted) },
                        { module: 'Platform Configuration', visible: currentRolePerms['System Configuration']?.some(i => i.id === 'sys_modify' && i.granted) },
                        { module: 'Roles & Privileges', visible: currentRolePerms['User Administration']?.some(i => i.id === 'user_create' && i.granted) },
                      ].map(({ module, visible }) => (
                        <div key={module} className={`p-3 rounded-[12px] border text-center ${
                          visible ? 'bg-white border-emerald-200 text-emerald-800' : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                        }`}>
                          <p className="text-xs font-extrabold">{module}</p>
                          <span className={`inline-block text-[10px] font-black mt-1 px-2 py-0.5 rounded-full ${
                            visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {visible ? 'Visible' : 'Hidden'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#F8F9FB] border border-[#E7ECF3] p-4 rounded-[18px] space-y-3">
                    <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">Critical Data Actions Overview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { action: 'Export Intelligence PDF/CSV', permitted: currentRolePerms['Intelligence Reports']?.some(i => i.id === 'intel_export' && i.granted) },
                        { action: 'Purge Database Archives', permitted: currentRolePerms['Database Management']?.some(i => i.id === 'db_purge' && i.granted) },
                        { action: 'Delete FIR Records', permitted: currentRolePerms['FIR Management']?.some(i => i.id === 'fir_delete' && i.granted) },
                        { action: 'Create Police User Accounts', permitted: currentRolePerms['User Administration']?.some(i => i.id === 'user_create' && i.granted) },
                        { action: 'Suspend Officers', permitted: currentRolePerms['User Administration']?.some(i => i.id === 'user_suspend' && i.granted) },
                        { action: 'Restore DB Snapshots', permitted: currentRolePerms['Database Management']?.some(i => i.id === 'db_restore' && i.granted) },
                      ].map(({ action, permitted }) => (
                        <div key={action} className="p-3 bg-white border border-[#E7ECF3] rounded-[12px] flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A]">{action}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                            permitted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {permitted ? 'Permitted' : 'Blocked'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SIMULATED BEARER TOKEN (JWT) */}
              {previewTab === 'jwt' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#64748B]">
                      Simulated OAuth2 / OpenID Connect Bearer Claims for authentication headers:
                    </p>

                    <button
                      onClick={() => {
                        const jwtStr = JSON.stringify({
                          iss: "ksp-iam-auth-gateway",
                          sub: `pol_role_${selectedRole.id}`,
                          role: selectedRole.name,
                          accessLevel: selectedRole.level,
                          activePermissions: kpiStats.granted,
                          scopes: grantedScopeList,
                          issuedAt: new Date().toISOString(),
                        }, null, 2);
                        navigator.clipboard.writeText(jwtStr);
                        addToast({
                          title: 'JWT Payload Copied',
                          message: 'Token scopes copied to clipboard.',
                          type: 'success',
                        });
                      }}
                      className="h-8 px-3 rounded-full border border-[#0B1F4D]/20 bg-white text-[#0B1F4D] font-extrabold text-xs hover:bg-[#0B1F4D]/5 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Token JSON
                    </button>
                  </div>

                  <div className="bg-[#0F172A] text-emerald-400 p-5 rounded-[18px] font-mono text-xs overflow-x-auto leading-relaxed shadow-inner border border-slate-800">
                    <pre>
                      {JSON.stringify(
                        {
                          iss: "ksp-iam-auth-gateway",
                          sub: `pol_role_${selectedRole.id}`,
                          role: selectedRole.name,
                          accessLevel: selectedRole.level,
                          riskProfile: selectedRole.riskLevel,
                          activePermissions: kpiStats.granted,
                          scopes: grantedScopeList,
                          issuedAt: new Date().toISOString(),
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#F8F9FB] border-t border-[#E7ECF3] flex items-center justify-between">
              <span className="text-xs font-semibold text-[#64748B]">
                Karnataka Police RBAC Simulation Tool
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="h-9 px-6 rounded-full bg-[#0B1F4D] text-white font-extrabold text-xs hover:bg-[#0F2A6B] transition-colors cursor-pointer shadow-sm"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 8. EXPORT MATRIX MODAL ────────────────────────────────────────── */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E7ECF3] rounded-[26px] max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 space-y-4 p-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[14px] bg-[#0B1F4D] text-[#C79A2B] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">Export Permission Matrix</h3>
                  <p className="text-xs font-medium text-[#64748B]">Select export file format to generate RBAC documentation.</p>
                </div>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-[#F8F9FB] hover:bg-[#E7ECF3] text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Export Summary Info */}
            <div className="bg-[#F8F9FB] border border-[#E7ECF3] rounded-[18px] p-4 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-[#0F172A]">
                <span>Configured System Roles:</span>
                <span className="text-[#0B1F4D] font-extrabold">{roles.length} Roles</span>
              </div>
              <div className="flex justify-between font-bold text-[#0F172A]">
                <span>Permission Categories:</span>
                <span className="text-[#0B1F4D] font-extrabold">{Object.keys(currentRolePerms).length} Groups</span>
              </div>
              <div className="flex justify-between font-semibold text-[#64748B]">
                <span>Generated Timestamp:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handleDownloadCSV}
                className="w-full p-4 rounded-[18px] border border-[#E7ECF3] hover:border-[#0B1F4D] hover:bg-[#F4F7FF] transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#0F172A] group-hover:text-[#0B1F4D]">CSV Spreadsheet (.csv)</h4>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Compatible with Excel, Google Sheets &amp; security audit compliance tools.</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#64748B] group-hover:text-[#0B1F4D] shrink-0" />
              </button>

              <button
                onClick={handleDownloadJSON}
                className="w-full p-4 rounded-[18px] border border-[#E7ECF3] hover:border-[#0B1F4D] hover:bg-[#F4F7FF] transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#0F172A] group-hover:text-[#0B1F4D]">JSON Specification (.json)</h4>
                    <p className="text-[10px] text-[#64748B] mt-0.5">Structured schema for automated deployment, CI/CD &amp; system backups.</p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-[#64748B] group-hover:text-[#0B1F4D] shrink-0" />
              </button>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="h-9 px-5 rounded-full border border-[#E7ECF3] text-xs font-extrabold text-[#64748B] hover:bg-[#F8F9FB] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
