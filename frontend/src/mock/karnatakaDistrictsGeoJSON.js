// GeoJSON boundary polygons representing districts in Karnataka.
// Properties contain only geographical IDs to facilitate separate data binding for Module 8.

export const KARNATAKA_DISTRICTS_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'bengaluru',
      properties: {
        districtId: 'bengaluru',
        districtName: 'Bengaluru City'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [77.40, 13.15],
            [77.80, 13.15],
            [77.80, 12.80],
            [77.40, 12.80],
            [77.40, 13.15]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'mysuru',
      properties: {
        districtId: 'mysuru',
        districtName: 'Mysuru'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.50, 12.45],
            [76.80, 12.45],
            [76.80, 12.10],
            [76.50, 12.10],
            [76.50, 12.45]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'hubballi_dharwad',
      properties: {
        districtId: 'hubballi_dharwad',
        districtName: 'Hubballi-Dharwad'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [74.95, 15.50],
            [75.30, 15.50],
            [75.30, 15.20],
            [74.95, 15.20],
            [74.95, 15.50]
          ]
        ]
      }
    }
  ]
};
