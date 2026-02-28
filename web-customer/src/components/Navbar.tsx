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
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center space-x-8 rtl:space-x-reverse">
                        <Link to={`/${lang}/`} className="text-2xl font-black text-primary tracking-tighter">
                            TAREEQK
                        </Link>
                        <div className="hidden md:flex space-x-4 rtl:space-x-reverse">
                            <Link to={`/${lang}/track`} className="text-sm font-medium text-gray-600 hover:text-primary">
                                {t('track_request')}
                            </Link>
                            {user?.role === 'customer' && (
                                <Link to={`/${lang}/customer/dashboard`} className="text-sm font-medium text-gray-600 hover:text-primary">
                                    {t('my_requests')}
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <Link to={`/${lang}/admin/dashboard`} className="text-sm font-medium text-gray-600 hover:text-primary">
                                    Admin Panel
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                        >
                            <Globe className="w-4 h-4" />
                            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
                        </button>

                        {user ? (
                            <div className="flex items-center space-x-4 rtl:space-x-reverse border-l rtl:border-r rtl:border-l-0 pl-4 rtl:pr-4 border-gray-100">
                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                                </div>
                                <button
                                    onClick={() => { logout(); navigate(`/${lang}/login`); }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <Link to={`/${lang}/login`} className="text-sm font-medium text-gray-600 hover:text-primary">
                                    {t('login')}
                                </Link>
                                <Link to={`/${lang}/register`} className="btn-primary text-xs py-1.5 px-4">
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
