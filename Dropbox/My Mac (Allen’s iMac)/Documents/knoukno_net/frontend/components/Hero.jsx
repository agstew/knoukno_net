const imageUrls = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=800&q=80"
];

export default function Hero() {
  return (
    <section className="mb-4">
      <div className="hero-panel">
        <h2>Build Better Business Decisions Faster</h2>
        <p className="mb-3">
          KnoUKno.net helps founders ask better questions, capture answers, score ideas, and improve execution.
        </p>
        <div className="media-wall">
          {imageUrls.map((src) => (
            <img key={src} src={src} alt="Business planning and startup teamwork" loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
