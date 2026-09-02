import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Price from './pages/Price.jsx';
import Checkout from './pages/Checkout.jsx';
import Title from './pages/Title.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Question from './pages/Question.jsx';
import Grade from './pages/Grade.jsx';
import Rated from './pages/Rated.jsx';
import Average from './pages/Average.jsx';
import Print from './pages/Print.jsx';

const guard = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

export default function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          {/* Outside */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/price" element={<Price />} />

          {/* Inside */}
          <Route path="/checkout" element={guard(<Checkout />)} />
          <Route path="/checkout/success" element={guard(<Checkout />)} />
          <Route path="/title" element={guard(<Title />)} />
          <Route path="/dashboard" element={guard(<Dashboard />)} />
          <Route path="/questions" element={guard(<Question />)} />
          <Route path="/grade" element={guard(<Grade />)} />
          <Route path="/rated" element={guard(<Rated />)} />
          <Route path="/average" element={guard(<Average />)} />
          <Route path="/print" element={guard(<Print />)} />

          <Route
            path="*"
            element={
              <section className="kk-section text-center">
                <div className="container">
                  <h1 className="kk-section__title">Page not found</h1>
                  <p className="lead">That page is not part of the path.</p>
                </div>
              </section>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
