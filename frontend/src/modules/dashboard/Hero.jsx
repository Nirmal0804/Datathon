import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import kspLogo from '../../assets/ksp-logo.png';

export default function Hero({ onLoginClick }) {
  const handleReadDocumentation = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const maxLineWidth = pageWidth - margin * 2;
    
    // Header / Title Banner
    doc.setFillColor(11, 35, 65); // #0B2341
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CrimeIntel Platform Documentation', margin, 42);
    
    doc.setFontSize(9);
    doc.setTextColor(199, 154, 43); // #C79A2B Gold accent
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
      doc.setTextColor(11, 35, 65);
      doc.text(sec.title, margin, y);
      y += 18;
      
      doc.setDrawColor(230, 232, 236);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
      y += 8;

      sec.content.forEach(line => {
        const isBullet = line.startsWith('•');
        doc.setFont('helvetica', isBullet ? 'bold' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 60, 75);
        
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
    <section id="home" className="pt-32 pb-20 lg:pt-40 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#153E75]/4 rounded-full blur-[140px] -z-10 pointer-events-none"></div>
      
      <div className="text-center max-w-4xl mx-auto z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex justify-center"
        >
          <img 
            src={kspLogo} 
            alt="Karnataka State Police Emblem" 
            className="h-16 md:h-20 w-auto object-contain"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#153E75]/8 border border-[#153E75]/15 text-[#153E75] mb-8 shadow-sm"
        >
          <ShieldCheck className="w-4 h-4 text-[#153E75]" />
          <span className="text-xs font-bold tracking-wider uppercase">State Intelligence Network</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#C79A2B] ml-0.5" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111827] mb-6 leading-[1.1]"
        >
          Predict. Prevent. <br className="hidden md:block"/>
          <span className="text-[#153E75] relative inline-block">
            Protect Karnataka.
            <span className="absolute bottom-1.5 left-0 w-full h-1.5 bg-[#C79A2B]/25 rounded-full -z-10" />
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
          className="text-lg md:text-xl text-[#4B5563] mb-10 max-w-2xl mx-auto font-normal leading-relaxed text-balance"
        >
          An AI-driven crime analytics and visualization platform providing real-time intelligence, geospatial mapping, and predictive modeling for law enforcement.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={onLoginClick} 
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-[#153E75] hover:bg-[#0F2D56] rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(21,62,117,0.2)] hover:shadow-[0_6px_20px_rgba(21,62,117,0.3)] hover:-translate-y-0.5 flex items-center justify-center gap-2 active:translate-y-0 cursor-pointer"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleReadDocumentation}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-[#111827] bg-white border border-[#E6E8EC] hover:bg-[#F8F9FB] hover:border-[#D1D5DB] rounded-xl transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center justify-center gap-2 active:translate-y-0 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#153E75]" />
            Read Documentation
          </button>
        </motion.div>
      </div>
    </section>
  );
}
