import { useTranslation } from 'react-i18next';
import TowRequestForm from '../../request/components/TowRequestForm';

const LandingPage = () => {
    const { t } = useTranslation('common');

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
                <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left rtl:lg:text-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            {t('welcome')}
                        </div>
                        <h1 className="text-4xl tracking-tight font-black sm:text-6xl xl:text-7xl text-gray-900 leading-[1.1]">
                            Your roadside
                            <span className="block text-primary drop-shadow-sm">assistance partner</span>
                        </h1>
                        <p className="mt-6 text-lg text-gray-500 sm:text-xl lg:text-lg xl:text-xl leading-relaxed max-w-xl">
                            Quick, reliable, and professional towing services at your fingertips. Request help now or track your ongoing request.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                            <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black italic">T</div>
                                    ))}
                                </div>
                                <span>Trusted by 10k+ users</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6">
                        <TowRequestForm />
                    </div>
                </div>
            </div>

            {/* Features/Stats Section */}
            <div className="bg-gray-50/50 py-16 border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Fast Response', value: '< 15 min' },
                            { label: 'Available 24/7', value: 'Always On' },
                            { label: 'Verified Drivers', value: '100%' },
                            { label: 'Fair Pricing', value: 'Fixed Rates' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{stat.value}</p>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
