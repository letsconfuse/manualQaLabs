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
        <aside className="fixed bottom-0 left-0 right-0 h-16 w-full md:w-64 md:h-auto md:top-4 md:bottom-4 md:left-4 bg-surface/95 backdrop-blur-xl border-t md:border border-theme rounded-t-2xl md:rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] md:shadow-3d flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start z-50 transition-all duration-300 md:z-50 px-4 md:px-0">
            {/* Logo Area */}
            <Link to="/" className="hidden md:flex h-20 items-center justify-center md:justify-start md:px-6 border-b border-theme/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="p-2 bg-accent-primary/10 rounded-xl transition-transform">
                    <Shield className="w-8 h-8 text-accent drop-shadow-md" />
                </div>
                <span className="hidden md:block ml-3 font-black text-xl tracking-tight text-primary-color">
                    QA<span className="text-accent">LABS</span>
                </span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 md:grow-0 md:flex-auto flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch w-full md:w-auto md:py-8 md:px-4 md:space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => {
                            const isPathActive = isActive || (item.path === '/challenges' && location.pathname.startsWith('/challenge'));
                            return `flex items-center justify-center md:justify-start p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200 group ${isPathActive
                                ? 'bg-accent-primary text-white shadow-lg shadow-teal-500/30 md:translate-x-1'
                                : 'text-secondary-color hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white md:hover:translate-x-1'
                                }`
                        }}
                    >
                        <item.icon className="w-6 h-6 md:w-5 md:h-5" />
                        <span className="hidden md:block ml-3 text-sm font-bold">
                            {item.label}
                        </span>
                    </NavLink>
                ))}

                {/* Mobile Theme Toggle (Inside Nav for spacing) */}
                <button
                    onClick={toggleTheme}
                    className="md:hidden flex items-center justify-center p-2 rounded-xl text-secondary-color hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-6 h-6 text-amber-400" /> : <Moon className="w-6 h-6 text-indigo-500" />}
                </button>
            </nav>

            {/* Footer / Theme Toggle */}
            <div className="hidden md:flex p-4 border-t border-theme/50 flex-col gap-4">
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
