const ratings = [5, 4, 4, 3, 5, 4, 4, 5];

export default function RatedList() {
  return (
    <section className="info-card mb-4">
      <h3>RatedList.jsx</h3>
      <p>Ratings: {ratings.join(", ")}</p>
    </section>
  );
}
