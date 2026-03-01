import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    PlusCircle,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
    LogOut,
    X
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { t } = useTranslation('common');
    const { lang } = useParams<{ lang: string }>();
    const location = useLocation();
    const logout = useAuthStore(state => state.logout);

    const menuItems = [
        {
            id: 'dashboard',
            path: `/${lang}/customer/dashboard`,
            icon: LayoutDashboard,
            label: t('dashboard') || 'Dashboard'
        },
        {
            id: 'requests',
            path: `/${lang}/customer/requests`,
            icon: ClipboardList,
            label: t('my_requests') || 'My Requests'
        },
        {
            id: 'new-request',
            path: `/${lang}/customer/new-request`,
            icon: PlusCircle,
            label: t('new_request') || 'New Request'
        },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside
                className={`fixed inset-y-0 left-0 bg-white border-r border-gray-100 transition-all duration-300 z-50 
                    ${isOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'} 
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-50">
                        <Link to={`/${lang}/`} className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">T</div>
                            {isOpen && <span className="text-2xl font-black tracking-tighter text-gray-900">TAREEQK</span>}
                        </Link>
                        {isOpen && (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 mt-6 px-3 space-y-1">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`flex items-center p-3.5 rounded-2xl transition-all group
                                        ${active
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
                                        }
                                    `}
                                >
                                    <item.icon className={`w-6 h-6 shrink-0 ${active ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                    {isOpen && <span className="ml-3 font-bold truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-4 border-t border-gray-50 space-y-2">
                        <button
                            onClick={() => logout()}
                            className="flex items-center w-full p-3.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all group"
                        >
                            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            {isOpen && <span className="ml-3 font-bold">{t('logout') || 'Logout'}</span>}
                        </button>

                        {/* Desktop Collapse Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="hidden lg:flex items-center justify-center w-full p-2 text-gray-300 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                        >
                            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
