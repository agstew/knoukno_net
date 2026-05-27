import Link from 'next/link';

import FeatureShell from '../components/FeatureShell';

const links = [
  '/Title',
  '/Questions',
  '/Example',
  '/Answers',
  '/Grade',
  '/GradeList',
  '/Rated',
  '/RatedList',
  '/Average',
  '/AverageList',
  '/Print'
];

export default function ListPage() {
  return (
    <FeatureShell title="List">
      <section className="auth-card">
        <h2>Feature List</h2>
        <div className="link-grid">
          {links.map((href, index) => (
            <Link key={href} href={href} className="member-link">
              {index + 1}. {href.replace('/', '')}
            </Link>
          ))}
        </div>
      </section>
    </FeatureShell>
  );
}
