import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Home, Info, Trophy, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Trophy, label: 'Challenges', path: '/challenges' },
        { icon: Info, label: 'About', path: '/about' },
    ];

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-20 md:w-64 bg-surface/95 backdrop-blur-xl border border-theme rounded-2xl shadow-3d flex flex-col z-50 transition-all duration-300">
            {/* Logo Area */}
            <Link to="/" className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-theme/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="p-2 bg-accent-primary/10 rounded-xl transition-transform">
                    <Shield className="w-8 h-8 text-accent drop-shadow-md" />
                </div>
                <span className="hidden md:block ml-3 font-black text-xl tracking-tight text-primary-color">
                    QA<span className="text-accent">LABS</span>
                </span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 py-8 flex flex-col space-y-2 px-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => {
                            const isPathActive = isActive || (item.path === '/challenges' && location.pathname.startsWith('/challenge'));
                            return `flex items-center justify-center md:justify-start px-4 py-3 rounded-xl transition-all duration-200 group ${isPathActive
                                ? 'bg-accent-primary text-white shadow-lg shadow-teal-500/30 translate-x-1'
                                : 'text-secondary-color hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
                                }`
                        }}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="hidden md:block ml-3 text-sm font-bold">
                            {item.label}
                        </span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Theme Toggle */}
            <div className="p-4 border-t border-theme/50 flex flex-col gap-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center md:justify-start p-3 rounded-xl text-secondary-color hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                    <span className="hidden md:block ml-3 text-sm font-bold">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>

                <div className="text-[10px] font-mono text-secondary-color/60 hidden md:block px-2 text-center pb-2">
                    <p>v1.0.0-beta</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
