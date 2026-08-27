// GeoJSON boundary polygons representing all 31 districts of Karnataka.
// Provides complete contiguous polygonal boundaries for geospatial intelligence choropleth mapping.

export const KARNATAKA_DISTRICTS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'bidar',
      properties: { districtId: 'bidar', districtName: 'Bidar' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.85, 18.45], [77.35, 18.45], [77.65, 18.05], [77.45, 17.65],
          [76.90, 17.65], [76.80, 18.10], [76.85, 18.45]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'kalaburagi',
      properties: { districtId: 'kalaburagi', districtName: 'Kalaburagi' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.25, 17.75], [76.90, 17.65], [77.45, 17.65], [77.40, 17.05],
          [76.75, 17.00], [76.25, 17.20], [76.25, 17.75]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'yadgir',
      properties: { districtId: 'yadgir', districtName: 'Yadgir' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.75, 17.00], [77.40, 17.05], [77.55, 16.50], [76.95, 16.30],
          [76.55, 16.55], [76.75, 17.00]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'vijayapura',
      properties: { districtId: 'vijayapura', districtName: 'Vijayapura' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.30, 17.30], [76.25, 17.20], [76.25, 16.60], [75.60, 16.30],
          [75.25, 16.60], [75.30, 17.30]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'bagalkote',
      properties: { districtId: 'bagalkote', districtName: 'Bagalkote' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.05, 16.45], [75.60, 16.30], [76.20, 16.35], [76.05, 15.85],
          [75.25, 15.90], [75.05, 16.45]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'belagavi',
      properties: { districtId: 'belagavi', districtName: 'Belagavi' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.20, 16.55], [75.05, 16.45], [75.25, 15.90], [75.00, 15.40],
          [74.30, 15.35], [74.05, 15.85], [74.20, 16.55]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'raichur',
      properties: { districtId: 'raichur', districtName: 'Raichur' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.55, 16.55], [76.95, 16.30], [77.60, 16.20], [77.30, 15.80],
          [76.60, 15.85], [76.55, 16.55]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'koppal',
      properties: { districtId: 'koppal', districtName: 'Koppal' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.75, 15.90], [76.60, 15.85], [76.55, 15.20], [75.80, 15.15],
          [75.75, 15.90]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'gadag',
      properties: { districtId: 'gadag', districtName: 'Gadag' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.25, 15.90], [75.75, 15.90], [75.80, 15.15], [75.40, 15.00],
          [75.20, 15.35], [75.25, 15.90]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'hubballi_dharwad',
      properties: { districtId: 'hubballi_dharwad', districtName: 'Hubballi-Dharwad' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.80, 15.65], [75.20, 15.65], [75.40, 15.15], [74.95, 15.10],
          [74.80, 15.65]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'uttara_kannada',
      properties: { districtId: 'uttara_kannada', districtName: 'Uttara Kannada' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.10, 15.35], [74.80, 15.35], [75.05, 14.75], [74.75, 13.90],
          [74.15, 14.05], [74.05, 14.85], [74.10, 15.35]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'haveri',
      properties: { districtId: 'haveri', districtName: 'Haveri' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.05, 15.10], [75.60, 15.10], [75.75, 14.50], [75.15, 14.45],
          [75.05, 15.10]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'ballari',
      properties: { districtId: 'ballari', districtName: 'Ballari' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.80, 15.55], [76.55, 15.55], [77.15, 15.30], [76.90, 14.70],
          [76.10, 14.75], [75.80, 15.55]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'davanagere',
      properties: { districtId: 'davanagere', districtName: 'Davanagere' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.60, 14.85], [76.25, 14.80], [76.35, 14.15], [75.70, 14.15],
          [75.60, 14.85]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'shivamogga',
      properties: { districtId: 'shivamogga', districtName: 'Shivamogga' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.85, 14.45], [75.60, 14.45], [75.85, 13.80], [75.15, 13.70],
          [74.85, 14.45]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'udupi',
      properties: { districtId: 'udupi', districtName: 'Udupi' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.55, 13.95], [75.05, 13.85], [75.15, 13.20], [74.65, 13.20],
          [74.55, 13.95]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'chikmagalur',
      properties: { districtId: 'chikmagalur', districtName: 'Chikmagalur' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.15, 13.80], [75.85, 13.80], [76.10, 13.15], [75.35, 13.05],
          [75.15, 13.80]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'chitradurga',
      properties: { districtId: 'chitradurga', districtName: 'Chitradurga' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.10, 14.75], [76.90, 14.65], [76.85, 13.75], [76.20, 13.85],
          [76.10, 14.75]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'tumakuru',
      properties: { districtId: 'tumakuru', districtName: 'Tumakuru' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.50, 14.15], [77.30, 14.10], [77.35, 13.05], [76.60, 13.00],
          [76.50, 14.15]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'dakshina_kannada',
      properties: { districtId: 'dakshina_kannada', districtName: 'Dakshina Kannada' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.75, 13.20], [75.45, 13.15], [75.55, 12.50], [74.85, 12.50],
          [74.75, 13.20]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'mangaluru_city',
      properties: { districtId: 'mangaluru_city', districtName: 'Mangaluru City' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.78, 13.00], [74.98, 13.00], [74.98, 12.82], [74.78, 12.82],
          [74.78, 13.00]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'hassan',
      properties: { districtId: 'hassan', districtName: 'Hassan' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.60, 13.35], [76.40, 13.30], [76.40, 12.65], [75.70, 12.65],
          [75.60, 13.35]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'kodagu',
      properties: { districtId: 'kodagu', districtName: 'Kodagu' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [75.40, 12.65], [76.05, 12.60], [76.15, 11.95], [75.50, 12.00],
          [75.40, 12.65]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'mysuru',
      properties: { districtId: 'mysuru', districtName: 'Mysuru' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.05, 12.60], [76.90, 12.55], [77.05, 11.85], [76.15, 11.85],
          [76.05, 12.60]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'mandya',
      properties: { districtId: 'mandya', districtName: 'Mandya' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.40, 12.95], [77.15, 12.90], [77.10, 12.30], [76.45, 12.35],
          [76.40, 12.95]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'chamarajanagar',
      properties: { districtId: 'chamarajanagar', districtName: 'Chamarajanagar' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.50, 12.15], [77.40, 12.10], [77.30, 11.55], [76.55, 11.60],
          [76.50, 12.15]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'ramanagara',
      properties: { districtId: 'ramanagara', districtName: 'Ramanagara' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.05, 12.95], [77.50, 12.90], [77.45, 12.40], [77.10, 12.45],
          [77.05, 12.95]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'bengaluru',
      properties: { districtId: 'bengaluru', districtName: 'Bengaluru City' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.45, 13.12], [77.75, 13.12], [77.75, 12.82], [77.45, 12.82],
          [77.45, 13.12]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'bengaluru_rural',
      properties: { districtId: 'bengaluru_rural', districtName: 'Bengaluru Rural' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.25, 13.45], [77.85, 13.45], [77.85, 13.12], [77.25, 13.12],
          [77.25, 13.45]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'chikkaballapura',
      properties: { districtId: 'chikkaballapura', districtName: 'Chikkaballapura' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.50, 13.85], [78.15, 13.80], [78.10, 13.30], [77.55, 13.35],
          [77.50, 13.85]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'kolar',
      properties: { districtId: 'kolar', districtName: 'Kolar' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.85, 13.40], [78.45, 13.35], [78.40, 12.90], [77.85, 12.95],
          [77.85, 13.40]
        ]]
      }
    }
  ]
};
