import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, Tooltip, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ZoomIn, ZoomOut, Maximize2, MapPin, ShieldAlert, Zap, Layers, Network, Activity, Download } from 'lucide-react';
import { KARNATAKA_DISTRICTS_GEOJSON } from '../../../mock/karnatakaDistrictsGeoJSON';
import { DISTRICT_PREDICTION_DATA } from '../../../mock/districtPredictionData';

// Approximate center of Karnataka
const KARNATAKA_CENTER = [15.3173, 75.7139];

// Geographic district centers
const districtCoords = {
  'Bengaluru City': [12.9716, 77.5946],
  'Mysuru': [12.2958, 76.6394],
  'Hubballi-Dharwad': [15.3647, 75.1240],
  'Mangaluru City': [12.9141, 74.8560],
  'Belagavi': [15.8497, 74.4977],
  'Kalaburagi': [17.3297, 76.8343],
  'Davanagere': [14.4644, 75.9218],
  'Ballari': [15.1394, 76.9214],
  'Tumakuru': [13.3379, 77.1173],
  'Udupi': [13.3409, 74.7421],
  'Shivamogga': [13.9299, 75.5681],
  'Mandya': [12.5218, 76.8951],
  'Bidar': [17.9104, 77.5199],
  'Hassan': [13.0072, 76.1026],
  'Vijayapura': [16.8302, 75.7100],
  'Bagalkote': [16.1817, 75.6958],
  'Chamarajanagar': [11.9264, 76.9402],
  'Chikmagalur': [13.3161, 75.7720],
  'Chitradurga': [14.2300, 76.4000],
  'Dakshina Kannada': [12.7844, 75.2530],
  'Gadag': [15.4167, 75.6167],
  'Haveri': [14.7958, 75.4025],
  'Kodagu': [12.4244, 75.7389],
  'Kolar': [13.1367, 78.1292],
  'Koppal': [15.3525, 76.1558],
  'Raichur': [16.2000, 77.3500],
  'Ramanagara': [12.7150, 77.2875],
  'Uttara Kannada': [14.8181, 74.8189],
  'Yadgir': [16.7600, 77.1300],
  'Chikkaballapura': [13.4325, 77.7275],
  'Bengaluru Rural': [13.2284, 77.5786]
};

// Compute jitter coordinates for case
export const getCoordinatesForCase = (caseItem) => {
  const base = districtCoords[caseItem.district] || KARNATAKA_CENTER;
  const hash = caseItem.id.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) / 100 - 0.5) * 0.12; 
  const lngOffset = (((hash * 13) % 100) / 100 - 0.5) * 0.12;
  return [base[0] + latOffset, base[1] + lngOffset];
};

// District Centroids for custom clickable labels
const districtCentroids = [
  { name: 'Bengaluru City', id: 'bengaluru', coords: [12.9716, 77.5946] },
  { name: 'Mysuru', id: 'mysuru', coords: [12.2958, 76.6394] },
  { name: 'Hubballi-Dharwad', id: 'hubballi_dharwad', coords: [15.3647, 75.1240] }
];

// Police Stations Jurisdictions (Sectors/Beats)
const jurisdictions = [
  { center: [12.9716, 77.5946], radius: 6000, name: 'Cubbon Park PS Beat' },
  { center: [12.9856, 77.6046], radius: 5500, name: 'Koramangala PS Beat' },
  { center: [12.9786, 77.6400], radius: 7000, name: 'Indiranagar PS Beat' },
  { center: [15.3524, 75.1320], radius: 8000, name: 'Vidyanagar PS Beat' },
  { center: [12.2958, 76.6394], radius: 5000, name: 'Saraswathipuram PS Beat' },
];

// Custom map events listener to track zoom
function MapEventsHandler({ onZoomChange, onMapClick }) {
  const map = useMapEvents({
    zoomend() {
      if (onZoomChange) onZoomChange(map.getZoom());
    },
    click() {
      if (onMapClick) onMapClick();
    }
  });
  return null;
}

// Controller to smoothly pan & zoom map ONLY when resetKey changes (prevents snapping to Hubli on re-renders)
function MapController({ center, zoom, resetKey }) {
  const map = useMap();
  const prevResetKeyRef = React.useRef(null);

  useEffect(() => {
    // Only call map.setView if resetKey changed (initial load, reset click, or explicit search hit)
    if (resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = resetKey;
      if (center && Array.isArray(center) && center.length === 2) {
        map.setView(center, zoom || 7, { animate: true, duration: 0.8 });
      }
    }
  }, [center, zoom, map, resetKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (map && map.invalidateSize) {
        map.invalidateSize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export default function GISMap({
  filteredCases = [],
  layers = {},
  setLayers = () => {},
  selectedCase = null,
  setSelectedCase = () => {},
  mapState = { center: [15.3173, 75.7139], zoom: 7, resetKey: 0 },
  setMapState = () => {},
  role = 'analyst',
  onExportSnapshot = () => {},
  onDistrictClick = () => {}
}) {
  const [currentZoom, setCurrentZoom] = useState(7);
  const isAnalyst = role === 'analyst';

  const safeCases = Array.isArray(filteredCases) ? filteredCases : [];
  const safeLayers = layers || {};
  const safeMapState = mapState || { center: [15.3173, 75.7139], zoom: 7, resetKey: 0 };

  // Group cases by district when zoom level is low for clustering
  const districtClusters = useMemo(() => {
    const clusters = {};
    safeCases.forEach(c => {
      clusters[c.district] = (clusters[c.district] || 0) + 1;
    });
    return Object.entries(clusters).map(([district, count]) => ({
      district,
      count,
      coords: districtCoords[district] || KARNATAKA_CENTER
    }));
  }, [safeCases]);

  // Compute dynamic hotspots from the mock dataset
  const dynamicHotspots = useMemo(() => {
    const counts = {};
    const categories = {};
    filteredCases.forEach(c => {
      counts[c.district] = (counts[c.district] || 0) + 1;
      if (!categories[c.district]) categories[c.district] = {};
      categories[c.district][c.category] = (categories[c.district][c.category] || 0) + 1;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 4) // hotspot if > 4 cases
      .map(([district, count]) => {
        let dominantCat = '';
        let maxCount = 0;
        Object.entries(categories[district]).forEach(([cat, cCount]) => {
          if (cCount > maxCount) {
            maxCount = cCount;
            dominantCat = cat;
          }
        });
        const level = count > 10 ? 'Critical' : 'High';
        const color = level === 'Critical' ? '#ef4444' : '#f59e0b';
        return {
          district,
          center: districtCoords[district] || KARNATAKA_CENTER,
          count,
          dominantCat,
          level,
          color
        };
      });
  }, [filteredCases]);

  // Leaflet div icon with color-coded severities
  const getMarkerIcon = (severity, isSelected) => {
    const color = severity === 'Critical' || severity === 'High' 
      ? '#ef4444' // Red
      : severity === 'Medium'
        ? '#f59e0b' // Orange
        : '#10b981'; // Green

    const glow = isSelected ? 'ring-4 ring-white scale-125 shadow-[0_0_12px_#ffffff]' : 'border border-black/40';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%;" class="${glow} transition-transform duration-200"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
  };

  // Leaflet cluster DivIcon
  const getClusterIcon = (count) => {
    return L.divIcon({
      className: 'custom-cluster-icon',
      html: `<div class="w-8 h-8 rounded-full bg-primary/85 border border-primary text-white flex items-center justify-center font-mono font-bold text-xs shadow-lg hover:scale-110 transition-transform">${count}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const handleZoomIn = () => {
    setMapState(prev => ({
      ...prev,
      zoom: Math.min((prev.zoom || currentZoom) + 1, 18),
      resetKey: prev.resetKey + 1
    }));
  };

  const handleZoomOut = () => {
    setMapState(prev => ({
      ...prev,
      zoom: Math.max((prev.zoom || currentZoom) - 1, 4),
      resetKey: prev.resetKey + 1
    }));
  };

  const handleResetView = () => {
    setMapState({
      center: KARNATAKA_CENTER,
      zoom: 7,
      resetKey: mapState.resetKey + 1
    });
    setSelectedCase(null);
  };

  const toggleLayer = (key) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full h-full relative z-10">
      
      <MapContainer 
        center={KARNATAKA_CENTER} 
        zoom={7} 
        zoomControl={false}
        className="w-full h-full bg-slate-950"
        style={{ background: '#090d16' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        <MapEventsHandler 
          onZoomChange={(z) => {
            setCurrentZoom(z);
            setMapState(prev => ({ ...prev, zoom: z }));
          }} 
          onMoveChange={(coords) => {
            setMapState(prev => ({ ...prev, center: coords }));
          }}
          onMapClick={() => {}}
        />
        
        <MapController 
          center={mapState.center} 
          zoom={mapState.zoom} 
          resetKey={mapState.resetKey} 
        />

        {/* 1. Heatmap Layer overlay */}
        {isAnalyst && layers.showHeatmap && (
          filteredCases.map((c, idx) => {
            const coords = getCoordinatesForCase(c);
            const color = c.risk === 'Critical' || c.risk === 'High' ? '#ef4444' : c.risk === 'Medium' ? '#f59e0b' : '#10b981';
            return (
              <Circle
                key={`heatmap-${c.id}-${idx}`}
                center={coords}
                radius={13000}
                pathOptions={{
                  color: 'transparent',
                  fillColor: color,
                  fillOpacity: 0.14,
                  stroke: false
                }}
              />
            );
          })
        )}

        {/* 2. Crime Density Layer overlay */}
        {isAnalyst && layers.showDensity && (
          filteredCases.map((c, idx) => {
            const coords = getCoordinatesForCase(c);
            return (
              <Circle
                key={`density-${c.id}-${idx}`}
                center={coords}
                radius={6000}
                pathOptions={{
                  color: 'transparent',
                  fillColor: '#6366f1',
                  fillOpacity: 0.2,
                  stroke: false
                }}
              />
            );
          })
        )}

        {/* 3. Emerging Hotspot Layer (Dynamic circles) */}
        {layers.showHotspots && (
          isAnalyst ? (
            dynamicHotspots.map((h, i) => (
              <Circle
                key={`dyn-hotspot-${h.district}-${i}`}
                center={h.center}
                radius={h.count * 2000}
                pathOptions={{
                  color: h.color,
                  fillColor: h.color,
                  fillOpacity: 0.08,
                  weight: 1.5,
                  dashArray: '5 5'
                }}
              >
                <Popup>
                  <div className="p-1 min-w-[140px] text-slate-800 text-xs">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">AI Emerging Hotspot</span>
                    <h4 className="font-bold text-slate-900 mt-0.5">{h.district}</h4>
                    <p className="text-[10px] mt-1.5">Classification: <span className="font-bold text-rose-600">{h.level} Risk</span></p>
                    <p className="text-[10px] mt-0.5">Crime Count: <span className="font-bold">{h.count} cases</span></p>
                    <p className="text-[10px] mt-0.5">Dominant Category: <span className="font-bold text-primary">{h.dominantCat}</span></p>
                  </div>
                </Popup>
              </Circle>
            ))
          ) : (
            // Fallback for Field Officer's preset hotspots
            [
              { center: [12.9716, 77.5946], radius: 22000 },
              { center: [15.3647, 75.1240], radius: 18000 },
              { center: [12.2958, 76.6394], radius: 15000 },
            ].map((h, i) => (
              <Circle 
                key={i} 
                center={h.center} 
                radius={h.radius} 
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.12, weight: 1.5, dashArray: '4 4' }} 
              />
            ))
          )
        )}

        {/* 4. District Boundary Layer (GeoJSON) */}
        {layers.showBoundaries && (
          <GeoJSON 
            key="karnataka-districts-geojson"
            data={KARNATAKA_DISTRICTS_GEOJSON}
            style={(feature) => {
              const p = DISTRICT_PREDICTION_DATA[feature.properties.districtId];
              const riskColor = !p ? '#6366f1' :
                p.riskLevel === 'Critical' ? '#ef4444' :
                p.riskLevel === 'High' ? '#f97316' :
                p.riskLevel === 'Medium' ? '#eab308' : '#10b981';

              return {
                color: isAnalyst ? riskColor : '#6366f1',
                fillColor: isAnalyst ? riskColor : '#6366f1',
                fillOpacity: isAnalyst ? 0.15 : 0.04,
                weight: 2,
                opacity: 0.9,
                dashArray: isAnalyst ? '0' : '6 6'
              };
            }}
            onEachFeature={(feature, layer) => {
              const p = DISTRICT_PREDICTION_DATA[feature.properties.districtId];
              if (!p || !isAnalyst) return;

              // Hover/Tooltip overlay
              layer.bindTooltip(`
                <div style="font-family: sans-serif; line-height: 1.4; padding: 4px; color: #fff;">
                  <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 11px;">${p.districtName}</h4>
                  <div style="font-family: monospace; font-size: 9px; color: #cbd5e1; margin-bottom: 6px;">
                    Risk Score: <strong style="color: #f43f5e;">${p.riskScore}/100</strong><br/>
                    Risk Category: <strong>${p.riskLevel}</strong><br/>
                    Crime Growth: <strong style="color: #ef4444;">${p.growth}</strong>
                  </div>
                  <p style="margin: 0; font-size: 8px; color: #818cf8; font-style: italic;">Click to view AI Prediction</p>
                </div>
              `, { sticky: true });

              layer.on({
                click: () => {
                  if (onDistrictClick) {
                    onDistrictClick(feature.properties.districtId);
                  }
                },
                mouseover: (e) => {
                  e.target.setStyle({
                    fillOpacity: 0.3,
                    weight: 3,
                    color: '#ffffff'
                  });
                },
                mouseout: (e) => {
                  const p = DISTRICT_PREDICTION_DATA[feature.properties.districtId];
                  const riskColor = !p ? '#6366f1' :
                    p.riskLevel === 'Critical' ? '#ef4444' :
                    p.riskLevel === 'High' ? '#f97316' :
                    p.riskLevel === 'Medium' ? '#eab308' : '#10b981';

                  e.target.setStyle({
                    color: riskColor,
                    fillColor: riskColor,
                    fillOpacity: 0.15,
                    weight: 2,
                    opacity: 0.9
                  });
                }
              });
            }}
          />
        )}

        {/* Custom Centroid District Labels (Clickable) */}
        {isAnalyst && layers.showBoundaries && districtCentroids.map((dc) => (
          <Marker
            key={`centroid-label-${dc.id}`}
            position={dc.coords}
            icon={L.divIcon({
              className: 'custom-district-label',
              html: `<div style="background-color: rgba(15, 23, 42, 0.95); border: 1px solid rgba(51, 65, 85, 0.6); font-size: 9px; font-weight: bold; color: #ffffff; padding: 2px 6px; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; white-space: nowrap; text-align: center;">${dc.name}</div>`,
              iconSize: [100, 20],
              iconAnchor: [50, 10]
            })}
            eventHandlers={{
              click: () => {
                if (onDistrictClick) {
                  onDistrictClick(dc.id);
                }
              }
            }}
          />
        ))}

        {/* 5. Police Jurisdiction Layer overlay */}
        {isAnalyst && layers.showJurisdictions && jurisdictions.map((j, i) => (
          <Circle
            key={`jurisdiction-${i}`}
            center={j.center}
            radius={j.radius}
            pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.03, weight: 1, dashArray: '3 3' }}
          >
            <Popup>
              <div className="p-1 text-slate-800 text-xs">
                <span className="font-semibold text-slate-900">{j.name}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Primary station jurisdiction sector.</p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Crime Markers (clustered vs. individual) */}
        {layers.showMarkers && (
          (layers.showClusters && currentZoom <= 7) ? (
            // Render clustered counts
            districtClusters.map((cluster) => (
              <Marker
                key={cluster.district}
                position={cluster.coords}
                icon={getClusterIcon(cluster.count)}
                eventHandlers={{
                  click: () => {
                    setMapState({
                      center: cluster.coords,
                      zoom: 9,
                      resetKey: mapState.resetKey + 1
                    });
                  }
                }}
              />
            ))
          ) : (
            // Render individual markers
            filteredCases.map((c) => {
              const coords = getCoordinatesForCase(c);
              const isSelected = selectedCase?.id === c.id;
              return (
                <Marker
                  key={c.id}
                  position={coords}
                  icon={getMarkerIcon(c.risk, isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedCase(c);
                      setMapState(prev => ({
                        ...prev,
                        center: coords,
                        resetKey: prev.resetKey + 1
                      }));
                    }
                  }}
                >
                  <Popup>
                    <div className="p-1 min-w-[140px] text-slate-800">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{c.id}</p>
                      <h4 className="font-bold text-slate-900 text-xs mt-0.5">{c.category}</h4>
                      <p className="text-[10px] text-slate-600 mt-1">{c.policeStation}</p>
                      <span className={`inline-block py-0.5 px-1.5 mt-2 rounded text-[9px] font-bold text-white uppercase ${c.risk === 'Critical' || c.risk === 'High' ? 'bg-red-500' : c.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}>
                        {c.risk}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })
          )
        )}
      </MapContainer>

      {/* 6. Map Risk Legend */}
      {isAnalyst && layers.showBoundaries && (
        <div className="absolute top-4 left-16 z-[400] bg-slate-900/95 border border-slate-850 p-2.5 rounded-lg text-[9px] font-mono text-slate-400 shadow-lg space-y-1.5 select-none w-32">
          <span className="block font-bold text-slate-300 uppercase tracking-widest text-[8px]">Predictive Risk</span>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#ef4444] border border-red-600/30" /> Critical Risk</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#f97316] border border-orange-600/30" /> High Risk</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#eab308] border border-yellow-600/30" /> Medium Risk</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#10b981] border border-emerald-600/30" /> Low Risk</div>
          </div>
        </div>
      )}

      {/* Floating Map Controls (Circular White Buttons) */}
      <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-2.5 shadow-sm">
        <button 
          onClick={handleZoomIn}
          className="w-12 h-12 rounded-full bg-white text-[#0F172A] border border-[#E7ECF3] shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-[#0F172A]" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-12 h-12 rounded-full bg-white text-[#0F172A] border border-[#E7ECF3] shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-[#0F172A]" />
        </button>
        <button 
          onClick={handleResetView}
          className="w-12 h-12 rounded-full bg-white text-[#0F172A] border border-[#E7ECF3] shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-[#0F172A]" />
        </button>
        {onExportSnapshot && (
          <button 
            onClick={onExportSnapshot}
            className="w-12 h-12 rounded-full bg-white text-[#0F172A] border border-[#E7ECF3] shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all flex items-center justify-center cursor-pointer"
            title="Export Map Snapshot"
          >
            <Download className="w-5 h-5 text-[#0F172A]" />
          </button>
        )}

        {/* Quick Layer Toggles */}
        <div className="flex flex-col gap-2 p-2 bg-white border border-[#E7ECF3] rounded-full shadow-md mt-2 items-center">
          <button 
            onClick={() => toggleLayer('showMarkers')}
            className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showMarkers ? 'bg-[#0B1F4D] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Toggle Markers"
          >
            <MapPin className="w-4 h-4" />
          </button>
          
          {isAnalyst && (
            <>
              <button 
                onClick={() => toggleLayer('showHeatmap')}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showHeatmap ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Heatmap"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toggleLayer('showClusters')}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showClusters ? 'bg-[#0B1F4D] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Cluster Layer"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toggleLayer('showDensity')}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showDensity ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Density Layer"
              >
                <Network className="w-4 h-4" />
              </button>
              <button 
                onClick={() => toggleLayer('showJurisdictions')}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showJurisdictions ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Beat Sectors"
              >
                <Globe className="w-4 h-4" />
              </button>
            </>
          )}

          <button 
            onClick={() => toggleLayer('showHotspots')}
            className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showHotspots ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Toggle Hotspots"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button 
            onClick={() => toggleLayer('showBoundaries')}
            className={`w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer ${layers.showBoundaries ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Toggle Boundaries"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
