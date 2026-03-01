import React from 'react';
import TowRequestForm from '../../request/components/TowRequestForm';
import { Truck } from 'lucide-react';

const NewRequestPage: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Truck className="w-5 h-5 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">New Tow Request</h1>
                </div>
                <p className="text-gray-500 font-medium">Request a tow truck to your current location or a specific point on the map.</p>
            </div>

            <div className="max-w-4xl">
                <TowRequestForm className="shadow-none border-gray-100" />
            </div>
        </div>
    );
};

export default NewRequestPage;
