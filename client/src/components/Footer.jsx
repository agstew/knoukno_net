import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="kk-footer mt-auto no-print">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <div className="fs-4 fw-bolder text-white mb-2">
              Kno U <span className="text-gold">Kno</span>
            </div>
            <p className="mb-2">
              Know you know. The questions come from us — the answers come from you, and they are
              kept so you can use them later.
            </p>
            <p className="mb-0 small">knoukno.co</p>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="mb-3">Pages</h6>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/price">Price</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h6 className="mb-3">The path</h6>
            <ul className="list-unstyled d-grid gap-2 mb-0">
              <li><a href="/#law">Law</a></li>
              <li><a href="/#location">Location</a></li>
              <li><a href="/#hiring">Hiring</a></li>
              <li><a href="/#people">People</a></li>
            </ul>
          </div>

          <div className="col-lg-4">
            <h6 className="mb-3">Plans</h6>
            <ul className="list-unstyled d-grid gap-2 mb-3">
              <li>Free — 5 questions, 3 days, $0</li>
              <li>Member — 50 questions / month, $39</li>
              <li>Member-Bonus — 150 questions / month, $199</li>
              <li>Pro — 75 questions / month, $99</li>
              <li className="text-gold">Pro-Bonus — 175 questions / month, $299</li>
            </ul>
            <Link className="btn btn-gold btn-sm px-3" to="/price">Buy Now</Link>
          </div>
        </div>

        <hr className="border-secondary my-4" />

        <div className="d-flex flex-wrap justify-content-between gap-2 small">
          <span>&copy; {new Date().getFullYear()} Kno U Kno. All rights reserved.</span>
          <a href="mailto:knoukno006@gmail.com">knoukno006@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}
