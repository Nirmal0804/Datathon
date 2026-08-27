import React, { useEffect, useState, useMemo, useRef } from 'react';
import { APIProvider, Map, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { ZoomIn, ZoomOut, Maximize2, Layers, Zap } from 'lucide-react';
import { KARNATAKA_DISTRICTS_GEOJSON } from '../../../mock/karnatakaDistrictsGeoJSON';
import { DISTRICT_PREDICTION_DATA } from '../../../mock/districtPredictionData';

// Google Maps API Key from Environment
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Geographic center of Karnataka
export const KARNATAKA_CENTER = [15.3173, 75.7139];
export const GOOGLE_KARNATAKA_CENTER = { lat: 15.3173, lng: 75.7139 };

// Extract true external perimeter ring from district polygon collection (Geometric Dissolve / Boundary Extraction)
export const extractOuterPerimeter = (geoJson) => {
  if (!geoJson || !geoJson.features || geoJson.features.length === 0) return [];

  const segmentCount = new Map();
  const segmentMap = new Map();

  const round = (val) => Math.round(val * 1000) / 1000;
  const pointKey = (p) => `${round(p[0])},${round(p[1])}`;
  const segKey = (p1, p2) => {
    const k1 = pointKey(p1);
    const k2 = pointKey(p2);
    return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
  };

  // 1. Extract all edges across all district polygons
  geoJson.features.forEach((feature) => {
    const geom = feature.geometry;
    if (!geom) return;

    const rings = geom.type === 'Polygon'
      ? geom.coordinates
      : geom.type === 'MultiPolygon'
        ? geom.coordinates.flat(1)
        : [];

    rings.forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i++) {
        const p1 = ring[i];
        const p2 = ring[i + 1];
        const key = segKey(p1, p2);
        segmentCount.set(key, (segmentCount.get(key) || 0) + 1);
        if (!segmentMap.has(key)) {
          segmentMap.set(key, [p1, p2]);
        }
      }
    });
  });

  // 2. Identify segments that appear only ONCE (External perimeter edges)
  const outerSegments = [];
  segmentCount.forEach((count, key) => {
    if (count === 1) {
      outerSegments.push(segmentMap.get(key));
    }
  });

  if (outerSegments.length === 0) return [];

  // 3. Chain segments head-to-tail to form continuous closed perimeter loop
  const adjacency = new Map();
  outerSegments.forEach(([p1, p2]) => {
    const k1 = pointKey(p1);
    const k2 = pointKey(p2);
    if (!adjacency.has(k1)) adjacency.set(k1, []);
    if (!adjacency.has(k2)) adjacency.set(k2, []);
    adjacency.get(k1).push({ from: p1, to: p2 });
    adjacency.get(k2).push({ from: p2, to: p1 });
  });

  const visited = new Set();
  const path = [];
  const startKey = pointKey(outerSegments[0][0]);
  let currentKey = startKey;
  let currentPoint = outerSegments[0][0];
  path.push({ lat: currentPoint[1], lng: currentPoint[0] });

  while (currentKey) {
    const neighbors = adjacency.get(currentKey) || [];
    let nextStep = null;

    for (const step of neighbors) {
      const sKey = segKey(step.from, step.to);
      if (!visited.has(sKey)) {
        visited.add(sKey);
        nextStep = step;
        break;
      }
    }

    if (!nextStep) break;

    currentPoint = nextStep.to;
    currentKey = pointKey(currentPoint);
    path.push({ lat: currentPoint[1], lng: currentPoint[0] });

    if (currentKey === startKey && path.length > 3) {
      break;
    }
  }

  return path;
};

// Safe Risk Color Resolver
export const getRiskColor = (riskStr) => {
  if (!riskStr) return '#22c55e';
  const r = String(riskStr).toLowerCase();
  if (r.includes('critical') || r.includes('high')) return '#ef4444'; // Red
  if (r.includes('medium') || r.includes('warning')) return '#f59e0b'; // Amber
  return '#22c55e'; // Green
};

// Geographic district center coordinates
export const districtCoords = {
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

// Compute deterministic jitter coordinates for each case
export const getCoordinatesForCase = (caseItem) => {
  if (!caseItem) return KARNATAKA_CENTER;
  const districtName = caseItem.district || 'Bengaluru City';
  const base = districtCoords[districtName] || KARNATAKA_CENTER;
  const caseId = String(caseItem.id || 'FIR-000');
  const hash = caseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 100) / 100 - 0.5) * 0.12;
  const lngOffset = (((hash * 13) % 100) / 100 - 0.5) * 0.12;
  return [base[0] + latOffset, base[1] + lngOffset];
};

// Map Controller Sub-component to manage viewport, GeoJSON district polygons, state outline, and circles
function GoogleMapController({
  safeMapState,
  selectedCase,
  safeLayers,
  isAnalyst,
  onDistrictClick,
  dynamicHotspots,
  districtCrimeCounts,
  safeCases,
  onSelectHotspot,
  onSelectCase,
  setHoveredDistrict
}) {
  const map = useMap();
  const prevResetKeyRef = useRef(null);
  const circlesRef = useRef([]);
  const stateBorderPolylineRef = useRef(null);

  // Memoize derived outer perimeter from actual GeoJSON features
  const outerPerimeterPath = useMemo(() => {
    return extractOuterPerimeter(KARNATAKA_DISTRICTS_GEOJSON);
  }, []);

  // Handle Map Panning and Zooming when selectedCase or resetKey changes
  useEffect(() => {
    if (!map) return;

    if (selectedCase) {
      const coords = getCoordinatesForCase(selectedCase);
      map.panTo({ lat: coords[0], lng: coords[1] });
      map.setZoom(13);
    } else if (safeMapState.resetKey !== prevResetKeyRef.current) {
      prevResetKeyRef.current = safeMapState.resetKey;
      if (safeMapState.center && Array.isArray(safeMapState.center)) {
        map.panTo({ lat: safeMapState.center[0], lng: safeMapState.center[1] });
        map.setZoom(safeMapState.zoom || 7);
      }
    }
  }, [map, selectedCase, safeMapState.resetKey, safeMapState.center, safeMapState.zoom]);

  // 1. KARNATAKA OUTER STATE PERIMETER (Derived from real GeoJSON outer edges - 4px Red Border)
  useEffect(() => {
    if (!map) return;

    if (stateBorderPolylineRef.current) {
      stateBorderPolylineRef.current.setMap(null);
    }

    if (safeLayers.showBoundaries && outerPerimeterPath.length > 0) {
      stateBorderPolylineRef.current = new google.maps.Polyline({
        map,
        path: outerPerimeterPath,
        strokeColor: '#E00000', // KSP Red Accent
        strokeOpacity: 1.0,
        strokeWeight: 4, // 4px strong outer perimeter
        zIndex: 200
      });
    }

    return () => {
      if (stateBorderPolylineRef.current) {
        stateBorderPolylineRef.current.setMap(null);
      }
    };
  }, [map, safeLayers.showBoundaries, outerPerimeterPath]);

  // 2. CHOROPLETH DISTRICT POLYGONS DATA LAYER (All 31 Karnataka Districts)
  useEffect(() => {
    if (!map) return;

    // Clear previous data layer features
    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    if (safeLayers.showBoundaries && KARNATAKA_DISTRICTS_GEOJSON) {
      try {
        map.data.addGeoJson(KARNATAKA_DISTRICTS_GEOJSON);

        // Apply Translucent Choropleth Styling based on actual crime volume and risk
        map.data.setStyle((feature) => {
          const districtName = feature.getProperty('districtName');
          const districtId = feature.getProperty('districtId');
          const count = districtCrimeCounts[districtName] || 0;
          const p = districtId ? (DISTRICT_PREDICTION_DATA[districtId] || null) : null;

          // Default style for districts with no cases
          let fillColor = '#64748b'; // Neutral grey
          let fillOpacity = 0.08;
          let strokeColor = '#94a3b8';
          let strokeWeight = 1.5;

          if (count >= 8 || (p && p.riskLevel === 'Critical')) {
            fillColor = '#ef4444'; // Critical Red
            fillOpacity = 0.35;
            strokeColor = '#ef4444';
            strokeWeight = 1.5;
          } else if (count >= 5 || (p && p.riskLevel === 'High')) {
            fillColor = '#f97316'; // High Orange
            fillOpacity = 0.30;
            strokeColor = '#f97316';
            strokeWeight = 1.5;
          } else if (count >= 3 || (p && p.riskLevel === 'Medium')) {
            fillColor = '#f59e0b'; // Medium Amber
            fillOpacity = 0.25;
            strokeColor = '#f59e0b';
            strokeWeight = 1.5;
          } else if (count >= 1) {
            fillColor = '#22c55e'; // Low Green
            fillOpacity = 0.20;
            strokeColor = '#22c55e';
            strokeWeight = 1.5;
          }

          return {
            fillColor,
            fillOpacity,
            strokeColor,
            strokeWeight,
            strokeOpacity: 0.85,
            zIndex: 10
          };
        });

        // Hover Effect
        const mouseoverListener = map.data.addListener('mouseover', (event) => {
          const districtName = event.feature.getProperty('districtName');
          const count = districtCrimeCounts[districtName] || 0;
          setHoveredDistrict({ name: districtName, count });

          map.data.overrideStyle(event.feature, {
            fillOpacity: 0.50,
            strokeWeight: 2.5,
            strokeColor: '#ffffff',
            strokeOpacity: 1.0,
            zIndex: 20
          });
        });

        const mouseoutListener = map.data.addListener('mouseout', () => {
          setHoveredDistrict(null);
          map.data.revertStyle();
        });

        // Click Effect
        const clickListener = map.data.addListener('click', (event) => {
          const districtId = event.feature.getProperty('districtId');
          if (onDistrictClick && districtId) {
            onDistrictClick(districtId);
          }
        });

        return () => {
          google.maps.event.removeListener(mouseoverListener);
          google.maps.event.removeListener(mouseoutListener);
          google.maps.event.removeListener(clickListener);
        };
      } catch (err) {
        console.warn('GeoJSON layer error:', err);
      }
    }
  }, [map, safeLayers.showBoundaries, isAnalyst, districtCrimeCounts, onDistrictClick, setHoveredDistrict]);

  // 3. Manage Hotspot & Case-Level Circles Overlay
  useEffect(() => {
    if (!map) return;

    // Clean up existing native circles
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    // Render District Hotspot Circles (when showHotspots is true)
    if (safeLayers.showHotspots) {
      dynamicHotspots.forEach((h) => {
        // Controlled square-root scaling for district volume
        const radiusMeters = Math.sqrt(h.count) * 5500 + 6000;

        const circle = new google.maps.Circle({
          map,
          center: { lat: h.center[0], lng: h.center[1] },
          radius: Math.min(radiusMeters, 27000),
          fillColor: h.color,
          fillOpacity: 0.25,
          strokeColor: h.color,
          strokeOpacity: 0.9,
          strokeWeight: 3,
          zIndex: 50
        });

        circle.addListener('click', () => {
          if (onSelectHotspot) {
            onSelectHotspot(h);
          }
        });

        circlesRef.current.push(circle);
      });
    }

    // Render Individual Incident Markers (ONLY when showMarkers is true)
    if (safeLayers.showMarkers) {
      safeCases.forEach((c) => {
        const coords = getCoordinatesForCase(c);
        const color = getRiskColor(c.risk);

        const circle = new google.maps.Circle({
          map,
          center: { lat: coords[0], lng: coords[1] },
          radius: 1200, // Small incident dot (1.2km)
          fillColor: color,
          fillOpacity: 0.45,
          strokeColor: '#ffffff',
          strokeOpacity: 0.9,
          strokeWeight: 1,
          zIndex: 60
        });

        circle.addListener('click', () => {
          if (onSelectCase) {
            onSelectCase(c);
          }
        });

        circlesRef.current.push(circle);
      });
    }

    // Optional Crime Density Layer Overlay
    if (isAnalyst && safeLayers.showDensity) {
      safeCases.forEach((c) => {
        const coords = getCoordinatesForCase(c);
        const circle = new google.maps.Circle({
          map,
          center: { lat: coords[0], lng: coords[1] },
          radius: 4500,
          fillColor: '#6366f1',
          fillOpacity: 0.1,
          strokeColor: 'transparent',
          strokeWeight: 0,
          zIndex: 40
        });
        circlesRef.current.push(circle);
      });
    }

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, safeLayers.showHotspots, safeLayers.showMarkers, safeLayers.showDensity, dynamicHotspots, safeCases, isAnalyst, onSelectHotspot, onSelectCase]);

  return null;
}

export default function GoogleGISMap({
  filteredCases = [],
  layers = {},
  setLayers = () => { },
  selectedCase = null,
  setSelectedCase = () => { },
  mapState = { center: [15.3173, 75.7139], zoom: 7, resetKey: 0 },
  setMapState = () => { },
  role = 'analyst',
  onExportSnapshot = () => { },
  onDistrictClick = () => { }
}) {
  const isAnalyst = role === 'analyst';
  const safeCases = useMemo(() => (Array.isArray(filteredCases) ? filteredCases : []), [filteredCases]);
  const safeLayers = layers || {};
  const safeMapState = mapState || { center: [15.3173, 75.7139], zoom: 7, resetKey: 0 };

  const [activeInfoWindow, setActiveInfoWindow] = useState(null);
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [hoveredDistrict, setHoveredDistrict] = useState(null);

  // Compute District Crime Counts for choropleth rendering
  const districtCrimeCounts = useMemo(() => {
    const counts = {};
    safeCases.forEach((c) => {
      if (c && c.district) {
        counts[c.district] = (counts[c.district] || 0) + 1;
      }
    });
    return counts;
  }, [safeCases]);

  // Compute dynamic district hotspots from actual filteredCases (count > 0)
  const dynamicHotspots = useMemo(() => {
    const counts = {};
    const categories = {};
    const highestRisk = {};

    safeCases.forEach((c) => {
      if (!c || !c.district) return;
      counts[c.district] = (counts[c.district] || 0) + 1;
      if (!categories[c.district]) categories[c.district] = {};
      if (c.category) {
        categories[c.district][c.category] = (categories[c.district][c.category] || 0) + 1;
      }
      if (c.risk) {
        highestRisk[c.district] = highestRisk[c.district] || c.risk;
      }
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([district, count]) => {
        let dominantCat = '';
        let maxCount = 0;
        if (categories[district]) {
          Object.entries(categories[district]).forEach(([cat, cCount]) => {
            if (cCount > maxCount) {
              maxCount = cCount;
              dominantCat = cat;
            }
          });
        }
        const level = count >= 8 ? 'Critical' : count >= 5 ? 'High' : count >= 3 ? 'Medium' : 'Low';
        const color = getRiskColor(highestRisk[district] || level);
        return {
          district,
          center: districtCoords[district] || KARNATAKA_CENTER,
          count,
          dominantCat,
          level,
          color
        };
      });
  }, [safeCases]);

  const handleZoomIn = () => {
    setMapState((prev) => ({
      ...prev,
      zoom: Math.min((prev.zoom || 7) + 1, 18),
      resetKey: (prev.resetKey || 0) + 1
    }));
  };

  const handleZoomOut = () => {
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max((prev.zoom || 7) - 1, 4),
      resetKey: (prev.resetKey || 0) + 1
    }));
  };

  const handleResetView = () => {
    setMapState({
      center: KARNATAKA_CENTER,
      zoom: 7,
      resetKey: (mapState.resetKey || 0) + 1
    });
    setSelectedCase(null);
    setActiveInfoWindow(null);
  };

  const toggleLayer = (key) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectHotspot = (hotspot) => {
    setActiveInfoWindow({
      type: 'district',
      position: { lat: hotspot.center[0], lng: hotspot.center[1] },
      data: hotspot
    });
  };

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem); // Opens CrimeIntel case drawer
    const coords = getCoordinatesForCase(caseItem);
    setActiveInfoWindow({
      type: 'case',
      position: { lat: coords[0], lng: coords[1] },
      data: caseItem
    });
  };

  return (
    <div className="w-full h-full relative z-10 bg-slate-950 overflow-hidden">
      {!GOOGLE_MAPS_API_KEY ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
          <Zap className="w-8 h-8 text-amber-400 mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-white mb-1">Google Maps API Key Required</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Please configure <code className="text-amber-300">VITE_GOOGLE_MAPS_API_KEY</code> in your environment file.
          </p>
        </div>
      ) : (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            defaultCenter={GOOGLE_KARNATAKA_CENTER}
            defaultZoom={7}
            gestureHandling="greedy"
            scrollwheel={true}
            disableDefaultUI={true}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            <GoogleMapController
              safeMapState={safeMapState}
              selectedCase={selectedCase}
              safeLayers={safeLayers}
              isAnalyst={isAnalyst}
              onDistrictClick={onDistrictClick}
              dynamicHotspots={dynamicHotspots}
              districtCrimeCounts={districtCrimeCounts}
              safeCases={safeCases}
              onSelectHotspot={handleSelectHotspot}
              onSelectCase={handleSelectCase}
              setHoveredDistrict={setHoveredDistrict}
            />

            {/* InfoWindow on District Hotspot or Individual Case Click */}
            {activeInfoWindow && (
              <InfoWindow
                position={activeInfoWindow.position}
                onCloseClick={() => setActiveInfoWindow(null)}
              >
                {activeInfoWindow.type === 'case' ? (
                  /* Individual Case InfoWindow */
                  <div className="p-2 min-w-[180px] text-slate-900 font-sans">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      FIR Case Detail
                    </span>
                    <h4 className="font-extrabold text-sm text-[#0B1F4D] mb-1">
                      {activeInfoWindow.data.id}
                    </h4>
                    <div className="space-y-1 text-xs text-slate-700">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-bold">{activeInfoWindow.data.category}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">District:</span>
                        <span className="font-bold">{activeInfoWindow.data.district}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Station:</span>
                        <span className="font-bold">{activeInfoWindow.data.policeStation}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Risk Level:</span>
                        <span
                          className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                          style={{
                            backgroundColor: `${getRiskColor(activeInfoWindow.data.risk)}20`,
                            color: getRiskColor(activeInfoWindow.data.risk)
                          }}
                        >
                          {activeInfoWindow.data.risk || 'Normal'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-bold text-slate-900">{activeInfoWindow.data.status}</span>
                      </div>
                      <div className="flex justify-between gap-3 pt-1 border-t border-slate-200">
                        <span className="text-slate-500">Date:</span>
                        <span className="font-semibold text-slate-600">{activeInfoWindow.data.date}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* District Hotspot InfoWindow */
                  <div className="p-2 min-w-[160px] text-slate-900 font-sans">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      AI Hotspot Intelligence
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mb-1 leading-tight">
                      {activeInfoWindow.data.district}
                    </h4>
                    <div className="space-y-1 text-xs text-slate-700">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Risk Level:</span>
                        <span
                          className="font-bold px-1.5 py-0.2 rounded text-[10px]"
                          style={{
                            backgroundColor: `${activeInfoWindow.data.color}20`,
                            color: activeInfoWindow.data.color
                          }}
                        >
                          {activeInfoWindow.data.level}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Total Cases:</span>
                        <span className="font-bold">{activeInfoWindow.data.count}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Dominant Crime:</span>
                        <span className="font-bold text-[#E00000]">{activeInfoWindow.data.dominantCat || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      )}

      {/* District Hover Badge */}
      {hoveredDistrict && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2 text-white">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold font-sans">{hoveredDistrict.name}:</span>
          <span className="text-xs font-mono font-bold text-amber-300">{hoveredDistrict.count} cases</span>
        </div>
      )}

      {/* Floating Map Controls Overlay (Preserved from CrimeIntel UI) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-lg flex flex-col gap-1 backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Map View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Layers Toggle Button */}
        <div className="relative">
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg flex items-center justify-center transition-colors backdrop-blur-md cursor-pointer"
            title="Map Layer Controls"
          >
            <Layers className="w-4 h-4" />
          </button>

          {layersMenuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl z-30 backdrop-blur-md space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 text-[11px] uppercase tracking-wider mb-2">Map Layers</h4>
              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span>Case Markers</span>
                <input
                  type="checkbox"
                  checked={!!safeLayers.showMarkers}
                  onChange={() => toggleLayer('showMarkers')}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500"
                />
              </label>
              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span>District Boundaries</span>
                <input
                  type="checkbox"
                  checked={!!safeLayers.showBoundaries}
                  onChange={() => toggleLayer('showBoundaries')}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500"
                />
              </label>
              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span>Hotspots</span>
                <input
                  type="checkbox"
                  checked={!!safeLayers.showHotspots}
                  onChange={() => toggleLayer('showHotspots')}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500"
                />
              </label>
              <label className="flex items-center justify-between text-slate-300 cursor-pointer hover:text-white">
                <span>Crime Density</span>
                <input
                  type="checkbox"
                  checked={!!safeLayers.showDensity}
                  onChange={() => toggleLayer('showDensity')}
                  className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-red-500"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
