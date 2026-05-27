import { useMemo } from 'react';

import FeatureShell from '../components/FeatureShell';
import { loadWorkspace } from '../lib/clientStore';

export default function AveragePage() {
  const summary = useMemo(() => {
    const state = loadWorkspace();
    const gradeItems = state.grades || [];
    const ratingItems = state.ratings || [];

    const avgGrade = gradeItems.length
      ? (gradeItems.reduce((sum, item) => sum + Number(item.value || 0), 0) / gradeItems.length).toFixed(2)
      : '0.00';
    const avgRated = ratingItems.length
      ? (ratingItems.reduce((sum, item) => sum + Number(item.value || 0), 0) / ratingItems.length).toFixed(2)
      : '0.00';

    return { avgGrade, avgRated };
  }, []);

  return (
    <FeatureShell title="Average">
      <section className="auth-card stacked-list">
        <h2>Average</h2>
        <section className="section-row"><span>Average Grade</span><span>{summary.avgGrade}</span></section>
        <section className="section-row"><span>Average Rated</span><span>{summary.avgRated}</span></section>
      </section>
    </FeatureShell>
  );
}
