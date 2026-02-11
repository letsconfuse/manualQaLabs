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

    const handlePermissionChange = (perm) => {
        // BUG: We only toggle, we don't check dependencies immediately here (or we do it wrong)
        // The tester has to realize that checks are missing.
        const newVal = !permissions[perm];

        setPermissions(prev => ({
            ...prev,
            [perm]: newVal
        }));

        addLog({ type: 'info', message: `Toggled permission: ${perm}` });

        // Edge Case Checks on Click
        if (perm === 'viewUsers' && newVal === false && permissions.editUsers) {
            addLog({ type: 'success', message: 'Logic Bug: "Edit Users" remained enabled while "View Users" was disabled.', edgeCaseId: 'orphan-perm' });
        }
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setPrevRole(role);
        setRole(newRole);
        addLog({ type: 'info', message: `Role changed to: ${newRole}` });

        // Auto-set defaults based on role
        if (newRole === 'Admin') {
            setPermissions({ viewUsers: true, editUsers: true, deleteUsers: true, viewReports: true, exportReports: true });
        } else if (newRole === 'Visitor') {
            // BUG: We don't clear existing high-level permissions if you downgrade from Admin
            // We just set defaults. If they had 'deleteUsers' manually checked, it might stay.
            if (role === 'Admin') {
                addLog({ type: 'success', message: 'Security: Privileges not cleared when downgrading role.', edgeCaseId: 'privilege-escalation' });
            }
            setPermissions({ viewUsers: true, editUsers: false, deleteUsers: false, viewReports: false, exportReports: false });
        }
    };

    const handleSave = () => {
        addLog({ type: 'info', message: 'Saving user settings...' });

        // Validation Logic
        if (!active) {
            // If inactive, but ANY permission is true, it's a bug.
            const hasPerms = Object.values(permissions).some(p => p);
            if (hasPerms) {
                addLog({ type: 'success', message: 'Security: Inactive user still has active permissions in DB.', edgeCaseId: 'ghost-access' });
                return;
            }
        }

        if (role === 'Intern' && permissions.deleteUsers) {
            addLog({ type: 'success', message: 'Security: Intern has "Delete" permission.', edgeCaseId: 'role-conflict' });
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
        }

        addLog({ type: 'info', message: 'Settings saved successfully.' });
    };

    return (
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <User className="text-primary" /> User Settings
                    </h3>
                    <p className="text-xs text-slate-500">Edit permissions for: <span className="font-mono">john.doe@company.com</span></p>
                </div>
                <div className="text-right">
                    <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                        <input
                            type="checkbox"
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-4 h-4 text-primary rounded"
                        />
                        Account Active
                    </label>
                </div>
            </div>

            <div className="space-y-6">

                {/* Role Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        value={role}
                        onChange={handleRoleChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="Admin">Super Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Intern">Intern</option>
                        <option value="Visitor">Visitor</option>
                        <option value="User">Standard User</option>
                    </select>
                </div>

                {/* Permissions Grid */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Lock className="w-4 h-4" /> Permissions</h4>

                    <div className="space-y-4">
                        {/* User Module */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">User Management</h5>
                            <div className="space-y-2 pl-2">
                                <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                                    <input type="checkbox" checked={permissions.viewUsers} onChange={() => handlePermissionChange('viewUsers')} className="text-primary rounded" />
                                    View Users
                                </label>
                                <div className="pl-6 space-y-2 border-l-2 border-slate-200 ml-1">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <input type="checkbox" checked={permissions.editUsers} onChange={() => handlePermissionChange('editUsers')} className="text-primary rounded" />
                                        Edit Users
                                    </label>
                                    <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <input type="checkbox" checked={permissions.deleteUsers} onChange={() => handlePermissionChange('deleteUsers')} className="text-red-500 rounded focus:ring-red-500" />
                                        <span className="text-red-600">Delete Users</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Reports Module */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Reports</h5>
                            <div className="space-y-2 pl-2">
                                <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                                    <input type="checkbox" checked={permissions.viewReports} onChange={() => handlePermissionChange('viewReports')} className="text-primary rounded" />
                                    View Reports
                                </label>
                                <div className="pl-6 border-l-2 border-slate-200 ml-1">
                                    <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-100 p-1 rounded">
                                        <input type="checkbox" checked={permissions.exportReports} onChange={() => handlePermissionChange('exportReports')} className="text-primary rounded" />
                                        Export Reports
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded transition-colors shadow-lg"
                >
                    Save Changes
                </button>

            </div>
        </div>
    );
};

export default RoleManager;
