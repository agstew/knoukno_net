export default function Section() {
  const cards = [
    {
      title: "Ask",
      text: "Generate unique startup-focused questions that challenge assumptions and sharpen business direction."
    },
    {
      title: "Answer",
      text: "Capture practical answers from your team and transform rough ideas into measurable actions."
    },
    {
      title: "Improve",
      text: "Grade and rate responses, then track averages so each business decision gets stronger over time."
    }
  ];

  return (
    <section className="section-grid mb-4">
      {cards.map((card) => (
        <article key={card.title} className="info-card">
          <h4>{card.title}</h4>
          <p className="mb-0">{card.text}</p>
        </article>
      ))}
    </section>
  );
}
