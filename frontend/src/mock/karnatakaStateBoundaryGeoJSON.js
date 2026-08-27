// Authentic Karnataka State Boundary GeoJSON FeatureCollection
// Represents the complete geographic perimeter of Karnataka state including coastline and borders with neighboring states.

export const KARNATAKA_STATE_BOUNDARY_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'karnataka_state',
      properties: {
        name: 'Karnataka',
        stateCode: 'KA',
        type: 'State'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            // Northernmost Tip (Bidar - Aurad / Bhalki)
            [77.05, 18.45], [77.18, 18.48], [77.36, 18.42], [77.49, 18.32],
            [77.62, 18.15], [77.65, 17.95], [77.58, 17.80], [77.45, 17.65],
            // Kalaburagi & Yadgir East Border (Telangana Border)
            [77.48, 17.48], [77.45, 17.25], [77.42, 17.08], [77.35, 16.92],
            [77.45, 16.75], [77.55, 16.55], [77.58, 16.38],
            // Raichur East & Krishna-Tungabhadra Confluence
            [77.50, 16.22], [77.62, 16.15], [77.55, 15.95], [77.35, 15.82],
            [77.20, 15.75],
            // Ballari (Bellary) & Sandur East Protrusion
            [77.15, 15.48], [77.22, 15.35], [77.18, 15.15], [76.95, 15.02],
            [76.92, 14.75], [76.78, 14.55],
            // Chitradurga & Pavagada (Tumakuru) East Enclave
            [76.88, 14.35], [76.95, 14.15], [77.12, 14.10], [77.30, 14.15],
            [77.38, 14.02], [77.25, 13.88],
            // Chikkaballapura & Kolar Eastern Border (Andhra / Tamil Nadu border)
            [77.52, 13.85], [77.75, 13.82], [78.10, 13.80], [78.25, 13.62],
            [78.45, 13.40], [78.48, 13.15], [78.40, 12.92], [78.22, 12.85],
            [77.95, 12.82], [77.80, 12.75],
            // Bengaluru Urban / Ramanagara / Chamarajanagar South-East
            [77.65, 12.65], [77.52, 12.45], [77.45, 12.28], [77.40, 12.10],
            [77.48, 11.95], [77.38, 11.78], [77.25, 11.58], [77.05, 11.52],
            // Southern Border (Bandipur / Gundlupet / Mysuru / Kodagu - Kerala border)
            [76.85, 11.55], [76.62, 11.60], [76.45, 11.72], [76.22, 11.85],
            [76.05, 11.92], [75.82, 11.98], [75.65, 12.02], [75.52, 12.15],
            [75.40, 12.35], [75.32, 12.52],
            // Dakshina Kannada & Mangaluru Coastline (Arabian Sea)
            [74.98, 12.68], [74.85, 12.82], [74.82, 12.95], [74.78, 13.12],
            // Udupi Coastline (Malpe / Kundapura)
            [74.70, 13.35], [74.65, 13.55], [74.58, 13.78], [74.52, 13.95],
            // Uttara Kannada Coastline (Bhatkal / Honnavar / Kumta / Gokarna / Karwar)
            [74.45, 14.15], [74.38, 14.32], [74.32, 14.52], [74.22, 14.75],
            [74.12, 14.88], [74.08, 15.02],
            // Goa Border & Western Ghats (Castle Rock / Chorla Ghat / Khanapur)
            [74.15, 15.22], [74.22, 15.45], [74.18, 15.65], [74.10, 15.82],
            // Belagavi North-West (Nipani / Chikkodi / Athani - Maharashtra border)
            [74.15, 16.02], [74.22, 16.25], [74.25, 16.55], [74.45, 16.68],
            [74.75, 16.72], [75.05, 16.65], [75.25, 16.78],
            // Vijayapura & Kalaburagi North Border (Maharashtra border)
            [75.45, 16.92], [75.65, 17.15], [75.85, 17.32], [76.15, 17.48],
            [76.35, 17.65], [76.62, 17.78], [76.85, 18.05], [77.05, 18.45]
          ]
        ]
      }
    }
  ]
};
