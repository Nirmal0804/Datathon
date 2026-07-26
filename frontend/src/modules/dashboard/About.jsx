import React from 'react';
import kspLogo from '../../assets/ksp-logo.jpg';

export default function About() {
  return (
    <section id="about" className="py-24 md:py-28 lg:py-32 bg-white border-y border-[#E6E8EC]/80">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <img 
          src={kspLogo} 
          alt="Karnataka State Police Emblem" 
          className="h-20 w-auto object-contain mx-auto mb-8"
        />
        
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#111827] mb-6 tracking-tight">Built for the Karnataka Police Datathon</h2>
        <p className="text-lg text-[#4B5563] leading-relaxed mb-10 max-w-3xl mx-auto font-normal text-balance">
          This platform was engineered as a robust, scalable, and secure solution for modern law enforcement. 
          By combining advanced AI/ML algorithms with geospatial intelligence and intuitive design, it transforms 
          raw police records into actionable, real-time insights—empowering officers to predict, prevent, and protect with unprecedented precision.
        </p>
        <div className="inline-block px-6 py-2.5 border border-[#153E75]/18 bg-[#153E75]/5 text-[#153E75] font-mono text-xs font-bold tracking-widest rounded-full shadow-sm hover:bg-[#153E75]/10 transition-colors duration-200">
          CONFIDENTIAL & PROPRIETARY
        </div>
      </div>
    </section>
  );
}
