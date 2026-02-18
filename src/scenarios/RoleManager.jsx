import React, { useState, useEffect } from 'react';
import { Shield, User, Lock } from 'lucide-react';

export const RoleConfig = {
    id: 'role-manager',
    title: 'Admin User Rights',
    description: 'Manage a system user. Permissions have dependencies (e.g., Cannot "Edit" if you cannot "View"). Find the logic gaps.',
    type: 'validation',
    difficulty: 'Hard',
    requirements: [
        { id: 'orphan-perm', title: 'Orphaned Permission', explanation: 'Disabling "View Users" should auto-disable "Edit Users".' },
        { id: 'role-conflict', title: 'Role Conflict', explanation: 'Interns should never have "Delete" rights, even if manually checked.' },
        { id: 'ghost-access', title: 'Ghost Access (Inactive User)', explanation: 'If "Account Active" is off, NO permissions should work.' },
        { id: 'privilege-escalation', title: 'Privilege Escalation', explanation: 'Switching from Admin -> Visitor should clear Admin rights.' },
        { id: 'self-lockout', title: 'Self Lockout', explanation: 'You cannot remove "Admin" role from yourself (the last admin).' },
    ]
};

const RoleManager = ({ addLog }) => {
    const [role, setRole] = useState('User');
    const [active, setActive] = useState(true);
    const [permissions, setPermissions] = useState({
        viewUsers: false,
        editUsers: false,
        deleteUsers: false,
        viewReports: false,
        exportReports: false,
    });

    // Track previous role to detect escalation attempts
    const [prevRole, setPrevRole] = useState('User');
    const [auditLogs, setAuditLogs] = useState([]);

    const logAuditEvent = (action, detail, severity = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setAuditLogs(prev => [{ timestamp, action, detail, severity }, ...prev].slice(0, 50));
    };

    const handlePermissionChange = (perm) => {
        // BUG: We only toggle, we don't check dependencies immediately here (or we do it wrong)
        // The tester has to realize that checks are missing.
        const newVal = !permissions[perm];

        setPermissions(prev => ({
            ...prev,
            [perm]: newVal
        }));

        addLog({ type: 'info', message: `Toggled permission: ${perm}` });
        logAuditEvent('PERMISSION_CHANGE', `User toggled ${perm} to ${newVal}`, newVal ? 'warning' : 'info');

        // Edge Case Checks on Click
        if (perm === 'viewUsers' && newVal === false && permissions.editUsers) {
            addLog({ type: 'success', message: 'Logic Bug: "Edit Users" remained enabled while "View Users" was disabled.', edgeCaseId: 'orphan-perm' });
            logAuditEvent('SECURITY_ALERT', 'Orphaned Permission Detected!', 'critical');
        }
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setPrevRole(role);
        setRole(newRole);
        addLog({ type: 'info', message: `Role changed to: ${newRole}` });
        logAuditEvent('ROLE_CHANGE', `Role changed from ${role} to ${newRole}`, 'warning');

        // Auto-set defaults based on role
        if (newRole === 'Admin') {
            setPermissions({ viewUsers: true, editUsers: true, deleteUsers: true, viewReports: true, exportReports: true });
        } else if (newRole === 'Visitor') {
            // BUG: We don't clear existing high-level permissions if you downgrade from Admin
            // We just set defaults. If they had 'deleteUsers' manually checked, it might stay.
            if (role === 'Admin') {
                addLog({ type: 'success', message: 'Security: Privileges not cleared when downgrading role.', edgeCaseId: 'privilege-escalation' });
                logAuditEvent('SECURITY_VIOLATION', 'Privilege Escalation: High privileges retained after downgrade.', 'critical');
            }
            setPermissions({ viewUsers: true, editUsers: false, deleteUsers: false, viewReports: false, exportReports: false });
        }
    };

    const handleSave = () => {
        addLog({ type: 'info', message: 'Saving user settings...' });
        logAuditEvent('SYSTEM_ACTION', 'Attempting to save user profile...', 'info');

        // Validation Logic
        if (!active) {
            // If inactive, but ANY permission is true, it's a bug.
            const hasPerms = Object.values(permissions).some(p => p);
            if (hasPerms) {
                addLog({ type: 'success', message: 'Security: Inactive user still has active permissions in DB.', edgeCaseId: 'ghost-access' });
                logAuditEvent('SECURITY_CRITICAL', 'Ghost Access: Inactive user has active permissions.', 'critical');
                return;
            }
        }

        if (role === 'Intern' && permissions.deleteUsers) {
            addLog({ type: 'success', message: 'Security: Intern has "Delete" permission.', edgeCaseId: 'role-conflict' });
            logAuditEvent('POLICY_VIOLATION', 'Intern assigned lethal permissions.', 'critical');
            return;
        }

        // Self Lockout Check (Mock: assume this is "you")
        // If you remove your own admin rights
        if (role !== 'Admin' && prevRole === 'Admin') {
            // addLog({ type: 'success', message: 'Logic: You just removed your own Admin access.', edgeCaseId: 'self-lockout' });
            // Let's make this easier: If they uncheck "Active" while logged in as themselves
        }

        if (active === false && role === 'Admin') {
            addLog({ type: 'success', message: 'Logic: You disabled the only Admin account (Self Lockout).', edgeCaseId: 'self-lockout' });
            logAuditEvent('SYSTEM_CRITICAL', 'Admin account disabled. System lockout imminent.', 'critical');
        }

        addLog({ type: 'info', message: 'Settings saved successfully.' });
    };

    return (
        <div className="w-full max-w-4xl bg-surface border border-theme p-0 rounded-xl shadow-3d overflow-hidden transition-colors flex flex-col md:flex-row">
            {/* Left Panel: Controls */}
            <div className="flex-1 border-r border-theme">
                <div className="bg-surface border-b border-theme p-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-primary-color flex items-center gap-2">
                            <User className="text-accent" /> User Settings
                        </h3>
                        <p className="text-secondary-color text-xs mt-1">Edit permissions for: <span className="font-mono text-accent">john.doe@company.com</span></p>
                    </div>
                    <div className="text-right">
                        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-secondary-color hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors">
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(e) => setActive(e.target.checked)}
                                className="w-4 h-4 text-accent rounded border-theme bg-body focus:ring-accent-primary"
                            />
                            Account Active
                        </label>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* Role Selector */}
                    <div>
                        <label className="block text-xs font-bold text-secondary-color mb-2 uppercase tracking-wider">Role</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="w-full bg-body border border-theme rounded-lg px-4 py-3 text-primary-color focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="Admin">Super Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Intern">Intern</option>
                            <option value="Visitor">Visitor</option>
                            <option value="User">Standard User</option>
                        </select>
                    </div>

                    {/* Permissions Grid */}
                    <div className="bg-body p-5 rounded-xl border border-theme">
                        <h4 className="text-sm font-bold text-primary-color mb-4 flex items-center gap-2 border-b border-theme pb-2">
                            <Lock className="w-4 h-4 text-secondary-color" /> Permissions
                        </h4>

                        <div className="space-y-4">
                            {/* User Module */}
                            <div>
                                <h5 className="text-[10px] font-bold text-secondary-color uppercase tracking-wide mb-2">User Management</h5>
                                <div className="space-y-2 pl-2">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer hover-bg-surface p-2 rounded transition-colors text-primary-color">
                                        <input type="checkbox" checked={permissions.viewUsers} onChange={() => handlePermissionChange('viewUsers')} className="text-accent rounded border-theme bg-surface" />
                                        View Users
                                    </label>
                                    <div className="pl-6 space-y-2 border-l-2 border-theme ml-1">
                                        <label className="flex items-center gap-3 text-sm cursor-pointer hover-bg-surface p-2 rounded transition-colors text-primary-color">
                                            <input type="checkbox" checked={permissions.editUsers} onChange={() => handlePermissionChange('editUsers')} className="text-accent rounded border-theme bg-surface" />
                                            Edit Users
                                        </label>
                                        <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-red-500/10 p-2 rounded transition-colors text-primary-color group">
                                            <input type="checkbox" checked={permissions.deleteUsers} onChange={() => handlePermissionChange('deleteUsers')} className="text-red-500 rounded border-theme bg-surface focus:ring-red-500" />
                                            <span className="group-hover:text-red-500 transition-colors">Delete Users</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Reports Module */}
                            <div>
                                <h5 className="text-[10px] font-bold text-secondary-color uppercase tracking-wide mb-2">Reports</h5>
                                <div className="space-y-2 pl-2">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer hover-bg-surface p-2 rounded transition-colors text-primary-color">
                                        <input type="checkbox" checked={permissions.viewReports} onChange={() => handlePermissionChange('viewReports')} className="text-accent rounded border-theme bg-surface" />
                                        View Reports
                                    </label>
                                    <div className="pl-6 border-l-2 border-theme ml-1">
                                        <label className="flex items-center gap-3 text-sm cursor-pointer hover-bg-surface p-2 rounded transition-colors text-primary-color">
                                            <input type="checkbox" checked={permissions.exportReports} onChange={() => handlePermissionChange('exportReports')} className="text-accent rounded border-theme bg-surface" />
                                            Export Reports
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full btn-3d-primary font-bold py-3 px-4 rounded-lg shadow-lg active:scale-[0.98]"
                    >
                        Save Changes
                    </button>

                </div>
            </div>

            {/* Right Panel: Audit Log */}
            <div className="w-full md:w-80 bg-surface/50 border-t md:border-t-0 md:border-l border-theme text-secondary-color p-0 flex flex-col font-mono text-xs min-h-[400px] transition-colors">
                <div className="p-4 border-b border-theme bg-body text-emerald-600 dark:text-emerald-400 font-bold tracking-wider flex items-center gap-2 transition-colors">
                    <Shield className="w-4 h-4" /> SECURITY AUDIT
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                    {auditLogs.length === 0 && (
                        <div className="text-secondary-color italic text-center mt-10">No events logged...</div>
                    )}
                    {auditLogs.map((log, i) => (
                        <div key={i} className="animate-fadeIn">
                            <div className="flex justify-between text-[10px] text-secondary-color mb-1">
                                <span>{log.timestamp}</span>
                                <span className={
                                    log.severity === 'critical' ? 'text-red-500 font-bold' :
                                        log.severity === 'warning' ? 'text-yellow-500' : 'text-blue-400'
                                }>{log.action}</span>
                            </div>
                            <div className={`p-2 rounded border-l-2 ${log.severity === 'critical' ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-200' :
                                log.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-200' :
                                    'bg-blue-500/5 border-blue-500 text-secondary-color'
                                }`}>
                                {log.detail}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RoleManager;
