import React from 'react';
import { User, Code2, Zap, Database, MapPin, BrainCircuit } from 'lucide-react';

const teamMembers = [
  'Nirmal P',
  'Tamilselvi A',
  'Udaya M',
  'Gabriel Sivakumar',
  'Vathsalya B',
];

const technologies = [
  { name: 'React', icon: Code2 },
  { name: 'FastAPI', icon: Zap },
  { name: 'PostgreSQL / Supabase', icon: Database },
  { name: 'Leaflet', icon: MapPin },
  { name: 'Python / ML', icon: BrainCircuit },
];

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-24 md:py-28 bg-white border-y border-[#E8EEF5] relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1F1] border border-[#E00000]/20 text-[#E00000] text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#E00000] animate-pulse" />
          ABOUT THE PROJECT
        </div>

        {/* Main Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#142B45] mb-3 tracking-tight leading-[1.15]">
          Built for the Karnataka Police Datathon
        </h2>

        {/* Red + Gold Accent Underline */}
        <div className="flex items-center justify-center gap-1.5 mb-5">
          <div className="w-12 h-1 bg-[#E00000] rounded-full" />
          <div className="w-6 h-1 bg-[#D49A00] rounded-full" />
        </div>

        {/* Description */}
        <p className="text-[#142B45]/75 text-base sm:text-lg leading-relaxed mb-8 font-normal">
          An AI-driven crime analytics platform designed to transform police data into actionable intelligence. The platform combines geospatial analysis, predictive modeling, and real-time insights to support informed decision-making and strengthen law enforcement operations.
        </p>

        <div className="space-y-6 pt-6 border-t border-[#E8EEF5] text-left">

          {/* BUILT BY */}
          <div className="text-center">
            <span className="text-[11px] font-extrabold text-[#142B45]/50 tracking-widest uppercase block mb-1">
              BUILT BY
            </span>
            <span className="text-xl font-extrabold text-[#142B45]">
              Tech Fortune
            </span>
          </div>

          {/* TEAM MEMBERS */}
          <div className="text-center">
            <span className="text-[11px] font-extrabold text-[#142B45]/50 tracking-widest uppercase block mb-3">
              TEAM MEMBERS
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {teamMembers.map((member) => (
                <div
                  key={member}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F7F8FA] border border-[#E8EEF5] text-[#142B45] text-xs sm:text-sm font-bold shadow-2xs hover:border-[#E00000]/30 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#E00000]" />
                  {member}
                </div>
              ))}
            </div>
          </div>

          {/* TECHNOLOGIES USED */}
          <div className="text-center">
            <span className="text-[11px] font-extrabold text-[#142B45]/50 tracking-widest uppercase block mb-3">
              TECHNOLOGIES USED
            </span>
            <div className="flex flex-wrap justify-center gap-2.5">
              {technologies.map((tech) => {
                const Icon = tech.icon;
                return (
                  <div
                    key={tech.name}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8EEF5] text-[#142B45] text-xs font-semibold shadow-2xs hover:border-[#D49A00]/50 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#D49A00]" />
                    {tech.name}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
