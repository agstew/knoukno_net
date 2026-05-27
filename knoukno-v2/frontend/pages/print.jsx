import FeatureShell from '../components/FeatureShell';
import { loadWorkspace } from '../lib/clientStore';

export default function PrintPage() {
  const state = loadWorkspace();

  function handlePrint() {
    window.print();
  }

  return (
    <FeatureShell title="Print">
      <section className="auth-card stacked-list print-surface">
        <h2>Print</h2>
        <section className="section-row"><span>Title</span><span>{state.businessTitle || 'Not set'}</span></section>
        <section className="section-row"><span>Answers</span><span>{(state.answers || []).length}</span></section>
        <section className="section-row"><span>Grades</span><span>{(state.grades || []).length}</span></section>
        <section className="section-row"><span>Ratings</span><span>{(state.ratings || []).length}</span></section>
        <button type="button" className="btn auth-button" onClick={handlePrint}>Print Page</button>
      </section>
    </FeatureShell>
  );
}
