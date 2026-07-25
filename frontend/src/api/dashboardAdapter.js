import {
  getDashboardSummary,
  getDistricts,
  getFieldMapCases,
  getIntelligenceTimeline,
  getIntelligenceHotspots,
  getIntelligenceAnalytics,
} from './endpoints';

function buildParams(filters) {
  const p = {};
  if (filters?.district && filters.district !== 'All') p.district = filters.district;
  if (filters?.policeStation && filters.policeStation !== 'All') p.station_id = filters.policeStation;
  if (filters?.category && filters.category !== 'All') p.crime_head = filters.category;
  if (filters?.status && filters.status !== 'All') p.status = filters.status;

  const now = new Date();
  if (filters?.dateRange && filters.dateRange !== 'All' && filters.dateRange !== 'Yearly') {
    const days = { Daily: 1, Weekly: 7, Monthly: 30, Quarterly: 90 }[filters.dateRange] || 30;
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    p.start_date = start.toISOString().slice(0, 10);
  }
  p.end_date = now.toISOString().slice(0, 10);
  return p;
}

function mapSummary(raw) {
  if (!raw) return { totalFIRs: emptyKpi(), activeCases: emptyKpi(), closedCases: emptyKpi(), totalArrests: emptyKpi() };
  return {
    totalFIRs: { value: raw.total_firs ?? 0, trend: 'up', percentage: '—' },
    activeCases: { value: raw.active_cases ?? 0, trend: 'up', percentage: '—' },
    closedCases: { value: raw.closed_cases ?? 0, trend: 'up', percentage: '—' },
    totalArrests: { value: raw.total_arrests ?? 0, trend: 'up', percentage: '—' },
  };
}

function emptyKpi() {
  return { value: 0, trend: 'up', percentage: '—' };
}

function mapTimeline(raw) {
  if (!raw?.buckets) return { daily: [], monthly: [], yearly: [] };
  const buckets = raw.buckets;
  const monthly = buckets.map(b => ({ month: b.period, count: b.fir_count }));
  return { daily: monthly.slice(-10), monthly, yearly: [] };
}

function mapDistricts(raw) {
  if (!raw?.districts) return [];
  return raw.districts
    .map(d => ({ district: d.district_name, count: d.fir_count }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);
}

function mapRecentCases(raw) {
  if (!raw?.items) return [];
  return raw.items.map(c => ({
    id: c.fir_number || c.fir_id,
    category: c.crime_head,
    district: c.district,
    policeStation: c.station_name || c.station_id,
    date: c.incident_date ? new Date(c.incident_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    rawDate: c.incident_date ? new Date(c.incident_date) : new Date(),
    risk: 'Medium',
    status: c.status || 'Active',
    arrests: 0,
    details: {
      officer: c.investigating_officer || 'Unassigned',
      section: (c.bns_sections || []).join(', ') || '—',
      summary: `${c.crime_head} case at ${c.station_name || c.station_id}, ${c.district}.`,
      timeline: [
        { date: 'FIR Registered', desc: 'Case logged in CCTNS' },
      ],
    },
  }));
}

function mapAlerts(hotspots) {
  if (!hotspots?.hotspots) return [];
  return hotspots.hotspots.slice(0, 7).map((h, i) => ({
    type: h.risk_level === 'Critical' ? 'critical' : h.risk_level === 'High' ? 'warning' : 'info',
    title: `${h.dominant_crime_type || 'Crime'} hotspot`,
    desc: `Hotspot detected at ${h.station_name || h.station_id || 'unknown station'}. FIR count: ${h.fir_count}.`,
    district: h.district || 'Unknown',
    category: h.dominant_crime_type || 'All',
    time: `${i + 1}h ago`,
  }));
}

export async function fetchDashboardData(filters) {
  const params = buildParams(filters);

  const [summaryRes, districtsRes, casesRes, timelineRes, hotspotsRes] = await Promise.allSettled([
    getDashboardSummary(params),
    getDistricts(),
    getFieldMapCases({ ...params, page: 1, page_size: 50 }),
    getIntelligenceTimeline({ ...params, granularity: 'monthly' }),
    getIntelligenceHotspots(params),
  ]);

  const summary = summaryRes.status === 'fulfilled' ? mapSummary(summaryRes.value) : { totalFIRs: emptyKpi(), activeCases: emptyKpi(), closedCases: emptyKpi(), totalArrests: emptyKpi() };
  const districts = districtsRes.status === 'fulfilled' ? mapDistricts(districtsRes.value) : [];
  const recentCases = casesRes.status === 'fulfilled' ? mapRecentCases(casesRes.value) : [];
  const trends = timelineRes.status === 'fulfilled' ? mapTimeline(timelineRes.value) : { daily: [], monthly: [], yearly: [] };
  const alerts = hotspotsRes.status === 'fulfilled' ? mapAlerts(hotspotsRes.value) : [];

  const categories = {};
  recentCases.forEach(c => {
    categories[c.category] = (categories[c.category] || 0) + 1;
  });
  const total = recentCases.length || 1;
  const categoriesList = Object.entries(categories)
    .map(([category, count]) => ({ category, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => b.count - a.count);

  return { summary, trends, categories: categoriesList, districts, recentCases, alerts };
}
