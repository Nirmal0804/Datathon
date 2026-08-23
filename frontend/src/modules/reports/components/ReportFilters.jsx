import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import GlobalFilterPanel from '../../../components/shared/ui/GlobalFilterPanel';
import GlobalFilterInput from '../../../components/shared/ui/GlobalFilterInput';
import GlobalFilterSelect from '../../../components/shared/ui/GlobalFilterSelect';

export default function ReportFilters({ searchQuery, setSearchQuery }) {
  return (
    <GlobalFilterPanel>
      <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 w-full">
        <GlobalFilterInput
          icon={Search}
          placeholder="Search reports by title, type, or district..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <GlobalFilterSelect icon={Filter}>
        <option value="">All Types</option>
        <option>Crime Summary</option>
        <option>District Report</option>
        <option>Network Analysis</option>
        <option>Predictive Risk</option>
        <option>Hotspot Analysis</option>
      </GlobalFilterSelect>

      <GlobalFilterSelect icon={Calendar}>
        <option>This Month</option>
        <option>Last 30 Days</option>
        <option>Last 90 Days</option>
        <option>This Year</option>
      </GlobalFilterSelect>
    </GlobalFilterPanel>
  );
}
