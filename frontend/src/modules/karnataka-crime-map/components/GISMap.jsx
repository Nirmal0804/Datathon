import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet marker icon issue in React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function GISMap() {
  // Approximate center of Karnataka
  const center = [15.3173, 75.7139];

  return (
    <div className="w-full h-full z-10 relative">
      <MapContainer 
        center={center} 
        zoom={7} 
        zoomControl={false}
        className="w-full h-full bg-slate-800"
        style={{ background: '#0f172a' }}
      >
        {/* Dark theme tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <ZoomControl position="bottomright" />

        {/* Dummy Marker for Bengaluru */}
        <Marker position={[12.9716, 77.5946]}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-slate-800 mb-1">Bengaluru City</h3>
              <p className="text-xs text-slate-600 mb-2">High density property crimes detected.</p>
              <div className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded inline-block uppercase tracking-wider">
                Critical Zone
              </div>
            </div>
          </Popup>
        </Marker>
        
        {/* Dummy Marker for Hubballi */}
        <Marker position={[15.3647, 75.1240]}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-slate-800 mb-1">Hubballi</h3>
              <p className="text-xs text-slate-600">Recent anomaly detected in violent crimes.</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
