const gradeHistory = [
  { period: "Week 1", score: 68 },
  { period: "Week 2", score: 73 },
  { period: "Week 3", score: 81 },
  { period: "Week 4", score: 84 }
];

export default function GradeList() {
  return (
    <section className="info-card mb-4">
      <h3>GradeList.jsx</h3>
      <ul className="mb-0">
        {gradeHistory.map((item) => (
          <li key={item.period}>
            {item.period}: {item.score}
          </li>
        ))}
      </ul>
    </section>
  );
}
