import { useEffect, useState } from 'react';

import FeatureShell from '../components/FeatureShell';
import { loadWorkspace } from '../lib/clientStore';

export default function RatedListPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const state = loadWorkspace();
    setItems(state.ratings || []);
  }, []);

  return (
    <FeatureShell title="RatedList">
      <section className="auth-card stacked-list">
        <h2>Rated List</h2>
        {items.length ? items.map((item) => (
          <section key={item.questionId} className="section-row">
            <span>{item.questionId}. {item.title}</span>
            <span>{item.value}</span>
          </section>
        )) : <section className="section-row"><span>No ratings yet</span></section>}
      </section>
    </FeatureShell>
  );
}
