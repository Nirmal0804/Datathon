import React, { useMemo, useState } from 'react';
import { ClipboardList, CheckSquare, Square } from 'lucide-react';
import { useToast } from '../../../components/ui/Toast';
import { useTranslation } from '../../../i18n';

export default function PatrolRecommendationCard({ hotspot }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [completedTasks, setCompletedTasks] = useState({});

  // Generate recommended checklists dynamically based on risk level and crime type
  const checklist = useMemo(() => {
    if (!hotspot) return [];

    const list = [];
    const isCritical = hotspot.riskLevel === 'Critical';
    const isHigh = hotspot.riskLevel === 'High';
    const type = hotspot.dominantCrime;

    // Default basic patrol
    list.push({ id: 'task-1', task: 'Routine precinct drive-by logging', desc: 'Conduct standard patrol log scans.' });

    // Risk level specific directives
    if (isCritical || isHigh) {
      list.push({ id: 'task-2', task: 'Establish static checkpoint', desc: 'Deploy stationary unit at high visibility intersection.' });
      list.push({ id: 'task-3', task: 'Increase night patrol frequency', desc: 'Reinforce patrols between 22:00 and 04:00.' });
    } else {
      list.push({ id: 'task-2-low', task: 'Community coordination review', desc: 'Discuss security measures with local ward leaders.' });
    }

    // Crime category specific directives
    if (type === 'Cybercrime' || type === 'Financial Fraud') {
      list.push({ id: 'task-4-cyber', task: 'Inspect public Wi-Fi & commercial nodes', desc: 'Audit local banking terminal clusters for fraud alerts.' });
      list.push({ id: 'task-5-cyber', task: 'Distribute cyber fraud advisories', desc: 'Provide informational flyers to local shops.' });
    } else if (type === 'Property Theft') {
      list.push({ id: 'task-4-theft', task: 'Check local pawn hubs & parking zones', desc: 'Monitor vehicle parking lots and verify licenses.' });
      list.push({ id: 'task-5-theft', task: 'Audit street light coverage', desc: 'Report dark spots to municipal corporation.' });
    } else if (type === 'Violent Crime') {
      list.push({ id: 'task-4-violent', task: 'Establish tactical foot patrol', desc: 'Deploy two officers on foot inside market alleys.' });
      list.push({ id: 'task-5-violent', task: 'Verify CCTV feed connections', desc: 'Ensure command center has active link to market cameras.' });
    } else if (type === 'Narcotics') {
      list.push({ id: 'task-4-narc', task: 'Conduct random vehicle checks', desc: 'Stop and check transit trucks near highway exits.' });
      list.push({ id: 'task-5-narc', task: 'Coordinate with Narcotic division', desc: 'Submit hotspot activity index to local special cell.' });
    }

    return list;
  }, [hotspot]);

  const toggleTask = (taskId, taskText) => {
    setCompletedTasks(prev => {
      const nextState = !prev[taskId];
      if (nextState) {
        toast.success(t('hotspots.directiveInitiated', 'Directive Initiated'), `Patrol task: "${taskText}" status updated.`);
      } else {
        toast.info(t('hotspots.directivePaused', 'Directive Paused'), `Patrol task: "${taskText}" status updated.`);
      }
      return {
        ...prev,
        [taskId]: nextState
      };
    });
  };

  if (!hotspot) {
    return null;
  }

  return (
    <div className="bg-white border border-[#E7ECF3] rounded-[20px] p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E7ECF3]">
        <ClipboardList className="w-5 h-5 text-[#0B1F4D]" />
        <div>
          <h3 className="text-xs font-black text-[#0F172A] uppercase tracking-wider">{t('hotspots.patrolDirectives', 'Patrol Directives Checklist')}</h3>
          <p className="text-[11px] font-mono font-bold text-[#64748B] mt-0.5">{t('hotspots.dynamicPatrolPlan', 'Dynamic patrol plan for')} {hotspot.hotspotId}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {checklist.map((item) => {
          const isDone = !!completedTasks[item.id];
          return (
            <button
              key={item.id}
              onClick={() => toggleTask(item.id, item.task)}
              className={`w-full text-left p-3.5 rounded-[14px] border transition-all flex items-start gap-3 cursor-pointer ${
                isDone 
                  ? 'bg-[#F8F9FB] border-[#E7ECF3] opacity-60' 
                  : 'bg-white border-[#E7ECF3] hover:border-[#0B1F4D]/40 hover:bg-[#F8F9FB]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isDone ? (
                  <CheckSquare className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100" />
                ) : (
                  <Square className="w-4.5 h-4.5 text-slate-400" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${isDone ? 'line-through text-[#64748B]' : 'text-[#0F172A]'}`}>
                  {item.task}
                </p>
                <p className="text-[11px] font-medium text-[#64748B] mt-0.5">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
