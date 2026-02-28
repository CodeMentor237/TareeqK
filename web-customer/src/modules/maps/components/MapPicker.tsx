import React, { useEffect, useState } from 'react';
import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLocation?: { lat: number; lng: number };
}

const MapPicker: React.FC<MapPickerProps> = ({ onLocationSelect, initialLocation }) => {
    const [position, setPosition] = useState(initialLocation || { lat: 24.7136, lng: 46.6753 }); // Default to Riyadh

    useEffect(() => {
        if (initialLocation) {
            setPosition(initialLocation);
        } else {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setPosition(newPos);
                    onLocationSelect(newPos.lat, newPos.lng);
                },
                () => console.log('Geolocation not available')
            );
        }
    }, [initialLocation, onLocationSelect]);

    const handleMapClick = (e: any) => {
        const newPos = { lat: e.detail.latLng.lat(), lng: e.detail.latLng.lng() };
        setPosition(newPos);
        onLocationSelect(newPos.lat, newPos.lng);
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={position}
                    defaultZoom={13}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    onClick={handleMapClick}
                    mapId={mapId}
                >
                    <AdvancedMarker position={position} />
                </Map>
            </APIProvider>
        </div>
    );
};

export default MapPicker;
