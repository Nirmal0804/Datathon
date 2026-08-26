import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import kspLogo from '../../assets/ksp-official-logo.png';
import vidhanSoudha from '../../assets/vidhan-soudha-exact.jpg';

export default function Hero({ onLoginClick }) {
  const handleReadDocumentation = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;
    
    // Header / Title Banner
    doc.setFillColor(224, 0, 0); // #E00000 Primary Red
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CrimeIntel Platform Documentation', margin, 42);
    
    doc.setFontSize(9);
    doc.setTextColor(212, 154, 0); // #D49A00 Primary Gold accent
    doc.text('KARNATAKA STATE POLICE INTELLIGENCE & CRIME ANALYTICS PLATFORM (README)', margin, 62);
    
    let y = 110;
    
    const checkPageBreak = (needed = 20) => {
      if (y + needed > doc.internal.pageSize.getHeight() - 40) {
        doc.addPage();
        y = 50;
      }
    };

    const sections = [
      {
        title: '1. EXECUTIVE SUMMARY & PROBLEM STATEMENT',
        content: [
          'CrimeIntel is an integrated crime analytics and intelligence platform that converts structured police data into operational and strategic insights.',
          'Law-enforcement agencies generate large volumes of information across FIRs, districts, police stations, arrests, chargesheets, victims, accused persons, and legal records.',
          'Key Challenges Addressed:',
          '• Fragmented Crime Records: Eliminates manual file merging across disparate station logs.',
          '• Analytical Visibility: Automated trend analysis, hotspot detection, and district metrics.',
          '• Proactive Policing: AI/ML predictive risk indicators turn historical logs into actionable alerts.',
          '• Complex Spatial Dynamics: Interactive Leaflet GIS maps expose crime clusters across Karnataka.'
        ]
      },
      {
        title: '2. KEY PLATFORM FEATURES',
        content: [
          '• Interactive Crime Dashboard: Real-time KPIs, trend charts, district rankings, and recent intakes.',
          '• Karnataka GIS Crime Map: Spatial crime visualization, heatmaps, beat sectors, and district layers.',
          '• Crime Hotspot Intelligence: DBSCAN spatial clustering identifying high-risk tactical zones.',
          '• District Intelligence: Station-level case breakdown, repeat offender tracking, and risk scores.',
          '• Criminal Network Analysis: Graph analysis of FIR-person relationships and co-accused links.',
          '• AI/ML Insights: Time-series forecasting, anomaly detection, and socio-economic correlation.',
          '• Reporting & Compliance: Bounded operational CSV/PDF exports and full audit logging.'
        ]
      },
      {
        title: '3. SYSTEM ARCHITECTURE & TECH STACK',
        content: [
          'Frontend Layer: React 19, Vite, Tailwind CSS, Leaflet GIS, Framer Motion',
          'Backend Layer: Python FastAPI, Pydantic validation, RESTful API controllers',
          'Database & Auth: Supabase PostgreSQL, Supabase Auth with JWT token verification',
          'Machine Learning: DBSCAN geospatial clustering, ARIMA/RandomForest time-series forecasting',
          'Deployment Platform: Zoho Catalyst Cloud Infrastructure'
        ]
      },
      {
        title: '4. SECURITY, RBAC & PRIVACY PROTOCOLS',
        content: [
          '• Deny-by-default authentication enforced by FastAPI JWT middleware.',
          '• Strict Role-Based Access Control (RBAC) across Officer, Analyst, and System Admin roles.',
          '• PII Data Masking: Person-level PII excluded from public analytics responses.',
          '• Cryptographic Security: HS256/JWKS token signature verification and security headers.',
          '• Immutable Audit Logs: Full user action traceability logged across system interactions.'
        ]
      },
      {
        title: '5. DATA PROVENANCE & TRANSPARENCY',
        content: [
          '• Source of Truth: Data ingested directly from Karnataka State Police reference schemas.',
          '• Zero Fabrication Policy: Synthetic values excluded from official government statistics.',
          '• Schema Coverage: Full normalization of FIRs, People, Arrests, Chargesheets, and Stations.'
        ]
      }
    ];

    sections.forEach(sec => {
      checkPageBreak(40);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(20, 43, 69); // #142B45 Navy
      doc.text(sec.title, margin, y);
      y += 18;
      
      doc.setDrawColor(232, 238, 245); // #E8EEF5 Light Navy
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
      y += 8;

      sec.content.forEach(line => {
        const isBullet = line.startsWith('•');
        doc.setFont('helvetica', isBullet ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(20, 43, 69); // #142B45 Navy
        
        const splitLines = doc.splitTextToSize(line, maxLineWidth);
        splitLines.forEach(l => {
          checkPageBreak(16);
          doc.text(l, margin, y);
          y += 15;
        });
      });
      y += 12;
    });

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(140, 150, 165);
      doc.text(`CONFIDENTIAL - KARNATAKA STATE POLICE INTELLIGENCE PLATFORM  |  Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.getHeight() - 25);
    }

    try {
      const pdfBlobUrl = doc.output('bloburl');
      window.open(pdfBlobUrl, '_blank');
    } catch {
      doc.save('CrimeIntel_Platform_Documentation.pdf');
    }
  };

  return (
    <section 
      id="home" 
      className="relative w-full min-h-[540px] lg:min-h-[600px] pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-200/60 bg-white"
    >
      {/* High-res Vidhan Soudha Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-[position:90%_center] lg:bg-[position:95%_center] bg-no-repeat opacity-100 z-0"
        style={{ backgroundImage: `url(${vidhanSoudha})` }}
      />

      {/* Smooth left-to-right white gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 via-20% to-transparent z-[1] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-2xl text-left">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-300 bg-white/90 text-slate-800 text-xs font-bold shadow-sm mb-6"
          >
            <ShieldCheck className="w-4 h-4 text-[#142B45]" />
            <span className="tracking-wider uppercase">STATE INTELLIGENCE NETWORK</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E00000] ml-0.5 animate-pulse" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-2"
          >
            <span className="text-[#142B45] block">Predict. Prevent.</span>
            <span className="text-[#D49A00] block mt-1">Protect Karnataka.</span>
          </motion.h1>

          {/* Red Underline */}
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 56 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="h-1 bg-[#E00000] rounded-full my-5" 
          />

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
            className="text-base sm:text-lg text-[#142B45]/80 max-w-xl font-normal leading-relaxed mb-8"
          >
            An AI-driven crime analytics and visualization platform providing real-time intelligence, geospatial mapping, and predictive modeling for law enforcement.
          </motion.p>

          {/* Buttons on same row */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24, ease: "easeOut" }}
            className="flex flex-row items-center gap-4 flex-wrap"
          >
            <button 
              onClick={onLoginClick} 
              className="px-6 py-3.5 text-sm font-semibold text-white bg-[#E00000] hover:bg-[#C90000] rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0 cursor-pointer"
            >
              Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleReadDocumentation}
              className="px-6 py-3.5 text-sm font-semibold text-[#E00000] bg-white border border-[#E00000] hover:bg-[#FFF1F1] rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center gap-2 active:translate-y-0 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#E00000]" />
              Read Documentation
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
