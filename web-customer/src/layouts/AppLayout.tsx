import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/auth.store';
import { useTranslation } from 'react-i18next';
import { Globe, Bell, User, Menu } from 'lucide-react';

const AppLayout: React.FC = () => {
    const { lang } = useParams<{ lang: string }>();
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize sidebar closed on mobile, open on desktop
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const { user } = useAuthStore();

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
        navigate(newPath);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Unified Sidebar (Handles Desktop & Mobile drawer via its own internal logic/props) */}
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 text-gray-500 hover:bg-gray-50 rounded-2xl transition-all shadow-sm active:scale-95"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-xl font-black text-gray-900 capitalize tracking-tight">
                                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                            title={lang === 'en' ? 'Arabic' : 'English'}
                        >
                            <Globe className="w-5 h-5" />
                        </button>

                        {/* Notifications */}
                        <button className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="h-10 w-[1px] bg-gray-100 mx-1 hidden sm:block" />

                        {/* User Profile */}
                        <div className="flex items-center gap-3 pl-2 sm:pl-4 cursor-pointer group">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-black text-gray-900 leading-none">{user?.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">{user?.role}</span>
                            </div>
                            <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-1.5xl flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:bg-indigo-100 transition-all group-hover:-translate-y-0.5 transform">
                                {user?.name?.charAt(0) || <User className="w-5 h-5" />}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-10 overflow-x-hidden">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
