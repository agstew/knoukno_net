import { useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import { loadWorkspace, saveWorkspace } from '../lib/clientStore';

export default function AverageListPage() {
  const [history, setHistory] = useState(() => loadWorkspace().averageHistory || []);

  function createSnapshot() {
    const state = loadWorkspace();
    const grades = state.grades || [];
    const ratings = state.ratings || [];

    const avgGrade = grades.length ? (grades.reduce((sum, item) => sum + Number(item.value || 0), 0) / grades.length).toFixed(2) : '0.00';
    const avgRated = ratings.length ? (ratings.reduce((sum, item) => sum + Number(item.value || 0), 0) / ratings.length).toFixed(2) : '0.00';

    const nextHistory = [
      {
        id: Date.now(),
        avgGrade,
        avgRated,
        createdAt: new Date().toISOString()
      },
      ...history
    ];

    saveWorkspace({
      ...state,
      averageHistory: nextHistory
    });
    setHistory(nextHistory);
  }

  return (
    <FeatureShell title="AverageList">
      <section className="auth-card stacked-list">
        <h2>Average List</h2>
        <button type="button" className="btn auth-button" onClick={createSnapshot}>Create Snapshot</button>
        {history.length ? history.map((item) => (
          <section key={item.id} className="section-row">
            <span>{new Date(item.createdAt).toLocaleString()}</span>
            <span>G {item.avgGrade} / R {item.avgRated}</span>
          </section>
        )) : <section className="section-row"><span>No snapshots yet</span></section>}
      </section>
    </FeatureShell>
  );
}
