import { jsPDF } from 'jspdf';

/**
 * Downloads official Karnataka State Police Architecture Documentation.
 * Attempts to fetch static PDF asset; if unavailable or blocked by backend URL pattern,
 * dynamically compiles a comprehensive official documentation PDF using jsPDF.
 */
export async function downloadArchitectureDocumentation(filename = 'Karnataka_Police_Architecture_Documentation.pdf', customAssetPath = null) {
  const assetPath = customAssetPath || (filename.toLowerCase().includes('ksp') ? './ksp-architecture-documentation.pdf' : './crimeintel-architecture-documentation.pdf');
  try {
    // 1. Attempt to fetch static file from public asset root
    const response = await fetch(assetPath, { method: 'GET' });
    const contentType = response.headers.get('content-type') || '';

    if (response.ok && (contentType.includes('pdf') || response.status === 200)) {
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    }
  } catch (err) {
    console.warn('[Doc PDF]: Static asset fetch bypassed, attempting direct window open.', err);
    window.open(assetPath, '_blank', 'noopener,noreferrer');
    return;
  }

  // 2. Client-side fallback generation with jsPDF
  generateArchitecturePDF(filename);
}

export function generateArchitecturePDF(filename = 'Karnataka_Police_Architecture_Documentation.pdf') {
  const doc = new jsPDF();
  const todayStr = new Date().toISOString().slice(0, 10);

  // --- PAGE 1: TITLE & EXECUTIVE SUMMARY ---
  doc.setFillColor(224, 0, 0); // KSP Crimson
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KARNATAKA STATE POLICE - CRIME ANALYTICS PLATFORM', 14, 12);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text('OFFICIAL SYSTEM ARCHITECTURE & OPERATIONAL SPECIFICATION', 14, 19);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('DOCUMENT METADATA', 14, 38);
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 41, 196, 41);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Document Reference: KSP-DOC-ARCH-2026-V1`, 14, 48);
  doc.text(`Generated Date:     ${todayStr}`, 14, 54);
  doc.text(`Classification:     RESTRICTED - LAW ENFORCEMENT INTELLIGENCE`, 14, 60);
  doc.text(`Issuing Authority:  Directorate of Police Communications & Tech, Karnataka`, 14, 66);

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY & PLATFORM OBJECTIVES', 14, 78);
  doc.line(14, 81, 196, 81);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  const summaryText = 
    'The Karnataka State Police Crime Analytics Platform is an integrated operational intelligence system designed to ' +
    'streamline FIR intake, predict geospatial crime hotspots, analyze co-offender criminal networks, and deliver ' +
    'real-time telemetry to law enforcement personnel across Karnataka\'s 31 police districts and 1,000+ precincts.\n\n' +
    'By unifying historical incident repositories with cutting-edge Machine Learning models (DBSCAN, XGBoost, and Graph ' +
    'Neural Networks), the platform transforms reactive policing into proactive, data-driven crime deterrence.';
  const splitSummary = doc.splitTextToSize(summaryText, 182);
  doc.text(splitSummary, 14, 88);

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('2. TRI-ROLE OPERATIONAL ARCHITECTURE', 14, 125);
  doc.line(14, 128, 196, 128);

  const roles = [
    {
      name: 'Field Officer Role',
      desc: 'Operational precinct dashboard tailored for station-level investigations. Enables rapid FIR registration, evidence logging, real-time tactical patrol assignments, and live alerts.'
    },
    {
      name: 'Intelligence Analyst Role',
      desc: 'Strategic intelligence suite providing state-level heatmaps, DBSCAN crime hotspot clustering, co-offender network topology analysis, and socio-economic correlation matrices.'
    },
    {
      name: 'System Administrator Role',
      desc: 'Governance and telemetry control center. Manages granular Role-Based Access Control (RBAC), multi-district precinct configurations, tamper-evident audit trails, and system health.'
    }
  ];

  let y = 135;
  roles.forEach((r, idx) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`${idx + 1}. ${r.name}`, 14, y);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    const splitR = doc.splitTextToSize(r.desc, 178);
    doc.text(splitR, 18, y + 5);
    y += 18;
  });

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('3. ARTIFICIAL INTELLIGENCE & MACHINE LEARNING PIPELINE', 14, 198);
  doc.line(14, 201, 196, 201);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  const mlText =
    '• Geospatial Hotspot Detection: Density-Based Spatial Clustering of Applications with Noise (DBSCAN) and Kernel Density Estimation (KDE) isolate repeat crime corridors.\n' +
    '• Incident Forecasting & Risk Scoring: XGBoost regression models assess 30-day temporal incident likelihood with 95% statistical confidence intervals.\n' +
    '• Criminal Network Analysis: Graph algorithms calculate Degree Centrality and modularity communities to uncover syndicate kingpins and co-accused links.\n' +
    '• Socio-Economic Correlation: Pearson correlation matrices correlate crime rates with urbanization, literacy, and per-capita income indicators.';
  const splitML = doc.splitTextToSize(mlText, 182);
  doc.text(splitML, 14, 208);

  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 245, 182, 32);
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(224, 0, 0);
  doc.text('SECURITY & COMPLIANCE NOTICE', 18, 252);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This documentation is proprietary property of the Karnataka State Police Department. All API access tokens, ' +
    'endpoint schemas, and database architectures described herein are governed by the Official Secrets Act and ' +
    'State Cybersecurity Compliance Guidelines.', 18, 259, { maxWidth: 174 }
  );

  // --- PAGE 2: TECHNICAL SPECIFICATIONS & API ARCHITECTURE ---
  doc.addPage();

  doc.setFillColor(20, 43, 69); // Dark Navy Header
  doc.rect(0, 0, 210, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TECHNICAL STACK & ENDPOINT SPECIFICATION', 14, 13);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('4. SYSTEM ARCHITECTURE & STACK', 14, 32);
  doc.line(14, 35, 196, 35);

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  const stackText =
    '• Frontend Layer: Modern React 19 SPA, TailwindCSS, Lucide Icons, Leaflet / Google GIS Map, Framer Motion.\n' +
    '• Backend Layer: High-performance Python FastAPI microservices with asynchronous endpoints and Pydantic v2 schemas.\n' +
    '• Storage & Cache: PostgreSQL 16 relational database with PostGIS geospatial extensions; Redis 7 in-memory cache.\n' +
    '• Authentication: Symmetric HMAC-SHA256 JWT tokens with role-scoped claims and HTTPOnly security headers.';
  const splitStack = doc.splitTextToSize(stackText, 182);
  doc.text(splitStack, 14, 42);

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('5. CORE REST API ENDPOINTS', 14, 82);
  doc.line(14, 85, 196, 85);

  const endpoints = [
    { method: 'GET', path: '/api/v1/dashboard/overview', desc: 'Returns state-wide aggregated KPI statistics, recent FIRs, and active alerts.' },
    { method: 'GET', path: '/api/v1/districts', desc: 'Retrieves all 31 Karnataka police district risk ratings and station performance indices.' },
    { method: 'GET', path: '/api/v1/analytics/hotspots', desc: 'Generates DBSCAN hotspot clusters and spatial coordinates for GIS rendering.' },
    { method: 'GET', path: '/api/v1/network/graph', desc: 'Computes co-offender network graph nodes, links, and syndicate cluster hierarchy.' },
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticates officer credentials and issues cryptographic session JWT token.' },
    { method: 'GET', path: '/api/v1/admin/audit-logs', desc: 'Fetches tamper-evident administrative audit records and system telemetry logs.' },
  ];

  let ey = 93;
  endpoints.forEach((ep) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(ep.method === 'GET' ? 16 : 224, ep.method === 'GET' ? 100 : 0, ep.method === 'GET' ? 50 : 0);
    doc.text(ep.method, 14, ey);
    doc.setTextColor(15, 23, 42);
    doc.text(ep.path, 32, ey);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(ep.desc, 32, ey + 4);
    ey += 14;
  });

  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('6. DATA PRIVACY & ACCESS PROTOCOLS', 14, 185);
  doc.line(14, 188, 196, 188);

  doc.setFontSize(8.5);
  doc.setFont('Helvetica', 'normal');
  const privacyText =
    'All criminal records, FIR narratives, and suspect biometrics stored in the platform are encrypted at rest with ' +
    'AES-256 and in transit via TLS 1.3. Role access strictly enforces jurisdictional boundaries, preventing unauthorized ' +
    'cross-precinct data retrieval unless explicitly approved by the State Command Headquarters.';
  const splitPrivacy = doc.splitTextToSize(privacyText, 182);
  doc.text(splitPrivacy, 14, 195);

  // Footer on Page 2
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Karnataka State Police • Crime Analytics Platform • Confidential Documentation', 14, 285);
  doc.text('Page 2 of 2', 185, 285);

  doc.save(filename);
}
