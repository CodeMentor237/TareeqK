import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';
import { Globe, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { t } = useTranslation('common');
    const { lang } = useParams<{ lang: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'ar' : 'en';
        const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
        navigate(newPath);
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex items-center gap-12">
                        <Link to={`/${lang}/`} className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">T</div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">TAREEQK</span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            <Link to={`/${lang}/track`} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                                {t('track_request')}
                            </Link>
                            {user?.role === 'customer' && (
                                <Link to={`/${lang}/customer/dashboard`} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                                    {t('dashboard')}
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={toggleLanguage}
                            className="p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
                        >
                            <Globe className="w-5 h-5" />
                        </button>

                        {user ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                                <Link
                                    to={user.role === 'admin' ? `/${lang}/admin/dashboard` : `/${lang}/customer/dashboard`}
                                    className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-2xl transition-all group/user"
                                >
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover/user:bg-primary/10 transition-colors">
                                        <User className="w-5 h-5 text-gray-400 group-hover/user:text-primary transition-colors" />
                                    </div>
                                    <div className="flex flex-col items-start hidden sm:flex">
                                        <span className="text-sm font-black text-gray-900 leading-none">{user.name}</span>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">{user.role}</span>
                                    </div>
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate(`/${lang}/login`); }}
                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to={`/${lang}/login`} className="text-sm font-bold text-gray-500 hover:text-primary px-4 py-2">
                                    {t('login')}
                                </Link>
                                <Link to={`/${lang}/register`} className="btn-primary shadow-lg shadow-primary/20">
                                    {t('register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
