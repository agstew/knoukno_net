const values = [5, 4, 4, 3, 5, 4, 4, 5];
const avg = values.reduce((sum, n) => sum + n, 0) / values.length;

export default function Average() {
  return (
    <section className="info-card mb-4">
      <h3>Average.jsx</h3>
      <p className="mb-0">Average Rating: {avg.toFixed(2)}</p>
    </section>
  );
}
