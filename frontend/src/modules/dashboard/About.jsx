import React from 'react';
import { Shield } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-surface/80 border-y border-slate-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <Shield className="w-16 h-16 text-primary mx-auto mb-8" />
        <h2 className="text-3xl font-bold text-white mb-6">Built for the Karnataka Police Datathon</h2>
        <p className="text-lg text-slate-400 leading-relaxed mb-8">
          This platform was engineered as a robust, scalable, and secure solution for modern law enforcement. 
          By combining advanced AI/ML algorithms with geospatial intelligence and intuitive design, it transforms 
          raw police records into actionable, real-time insights—empowering officers to predict, prevent, and protect with unprecedented precision.
        </p>
        <div className="inline-block px-6 py-2 border border-slate-700 rounded-full text-slate-300 font-mono text-sm">
          CONFIDENTIAL & PROPRIETARY
        </div>
      </div>
    </section>
  );
}
