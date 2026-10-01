import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, Sparkles, Crown, Rocket, Gift, ShieldCheck, RotateCcw, CreditCard, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";

const PLAN_ICONS = { free: Sparkles, members: Crown, pro: Rocket, bonus: Gift };

const FAQS = [
  {
    q: "Is this a subscription?",
    a: "Yes. Members bills $39 every month and Pro bills $436 every year through PayPal. Cancel any time and keep access until the period you already paid for ends.",
  },
  {
    q: "What happens after the free trial?",
    a: "After 3 days, free trial access expires. Your account remains and you can upgrade to continue.",
  },
  {
    q: "Can I get a refund?",
    a: "We offer a 7-day money-back guarantee if you are not satisfied. Contact us with your purchase email.",
  },
  {
    q: "How do I access my questions?",
    a: "Once registered and logged in, go to your Dashboard. Questions unlock based on your plan immediately after payment.",
  },
];

export default function Price() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [message, setMessage] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const { isAuthenticated, tier: tokenTier, isAdmin, logout, refreshUser } = useAuth();
  const [currentTier, setCurrentTier] = useState(tokenTier);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("payment") === "cancelled") {
      setMessage("Payment was cancelled. You can try again below.");
    }
    const orderId = params.get("paypal") === "return" ? params.get("token") : null;
    if (orderId) capturePayPal(orderId);
    const subscriptionId = params.get("paypal") === "subscribe-return" ? params.get("subscription_id") : null;
    if (subscriptionId) activateSubscription(subscriptionId);
    fetchPrices();
  }, [location.search]);

  useEffect(() => {
    setCurrentTier(tokenTier);
    if (!isAuthenticated) return;

    refreshUser()
      .then((account) => {
        if (account?.tier) setCurrentTier(account.tier);
        if (account?.subscriptionStatus) setSubscriptionStatus(account.subscriptionStatus);
      })
      .catch(() => {});
  }, [isAuthenticated, tokenTier, refreshUser]);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/payment/prices");
      if (res.ok) {
        const data = await res.json();
        setPrices(data);
      } else {
        setMessage("Could not load plan availability. Please try again.");
      }
    } catch (err) {
      setMessage("Network error loading plan availability.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (tierId) => {
    if (!isAuthenticated) {
      window.location.href = "/register";
      return;
    }
    const token = localStorage.getItem("token");
    setCheckoutLoading(tierId);
    try {
      const endpoint = tierId === "bonus" ? "/api/payment/create-order" : "/api/payment/create-subscription";
      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier: tierId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { message: "Your session expired. Please log in again to continue to PayPal." } });
        return;
      }
      if (res.ok && data.url) {
        if (data.message) {
          setMessage(data.message);
        }
        window.location.href = data.url;
      } else {
        setMessage(
          data.message || "Could not start checkout. Please try again."
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setMessage("Network error. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setCheckoutLoading("");
    }
  };

  const activateSubscription = async (subscriptionId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage("Confirming your subscription\u2026");
    try {
      const res = await apiFetch("/api/payment/activate-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscriptionId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { message: "Your session expired. Please log in again to finish your subscription." } });
        return;
      }
      if (res.ok) {
        window.location.href = "/dashboard?payment=success";
        return;
      }
      setMessage(data.message || "Could not confirm the subscription.");
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Cancel your subscription? You'll keep access until the current billing period ends.")) return;
    const token = localStorage.getItem("token");
    setCheckoutLoading("cancel");
    try {
      const res = await apiFetch("/api/payment/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessage(data.message || (res.ok ? "Your subscription was cancelled." : "Could not cancel your subscription."));
      if (res.ok) setSubscriptionStatus("cancelled");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setCheckoutLoading("");
    }
  };

  const capturePayPal = async (orderId) => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setMessage("Confirming your PayPal payment…");
    try {
      const res = await apiFetch("/api/payment/capture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        logout();
        navigate("/login", { replace: true, state: { message: "Your session expired. Please log in again to finish your payment." } });
        return;
      }
      if (res.ok) {
        window.location.href = "/dashboard?payment=success";
        return;
      }
      setMessage(data.message || "Could not confirm the payment.");
    } catch (err) {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const paidPlansById = prices.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});
  const checkoutAvailable = prices.some((plan) => plan.checkoutAvailable);
  const tierRank = { free: 0, members: 1, pro: 2 };

  const planAction = (plan) => {
    if (!isAuthenticated) {
      if (plan.id === "free") {
        return (
          <Link to="/register" className="btn btn-primary btn-block">
            Start Free Trial
          </Link>
        );
      }
      return (
        <Link to="/register" className="btn btn-primary btn-block">
          Buy Now
        </Link>
      );
    }

    if (isAdmin) {
      return <button className="btn btn-secondary btn-block" disabled>Admin Access</button>;
    }

    if (plan.id === "bonus") {
      if (currentTier === "free") {
        return <button className="btn btn-secondary btn-block" disabled>Upgrade to Members or Pro first</button>;
      }
      return (
        <button
          className="btn btn-primary btn-block"
          onClick={() => handleCheckout("bonus")}
          disabled={checkoutLoading === "bonus" || !checkoutAvailable}
        >
          {checkoutLoading === "bonus"
            ? "Redirecting…"
            : checkoutAvailable ? "Buy Now" : "Purchases unavailable"}
        </button>
      );
    }

    if (plan.id === currentTier) {
      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-block" disabled>Current Plan</button>
          {subscriptionStatus === "active" && (
            <button
              className="btn btn-link"
              onClick={handleCancelSubscription}
              disabled={checkoutLoading === "cancel"}
              style={{ fontSize: "0.78rem" }}
            >
              {checkoutLoading === "cancel" ? "Cancelling\u2026" : "Cancel subscription"}
            </button>
          )}
          {subscriptionStatus === "cancelled" && (
            <span style={{ fontSize: "0.72rem", color: "var(--color-text-light)", textAlign: "center" }}>
              Cancelled - access continues until your period ends
            </span>
          )}
        </div>
      );
    }

    if (tierRank[plan.id] < tierRank[currentTier]) {
      return <button className="btn btn-secondary btn-block" disabled>Included in Your Plan</button>;
    }

    if (plan.id === "free") {
      return <button className="btn btn-secondary btn-block" disabled>Free Trial Used</button>;
    }

    return (
      <button
        className="btn btn-primary btn-block"
        onClick={() => handleCheckout(plan.id)}
        disabled={checkoutLoading === plan.id || !checkoutAvailable}
      >
        {checkoutLoading === plan.id
          ? "Redirecting…"
          : checkoutAvailable ? "Buy Now" : "Purchases unavailable"}
      </button>
    );
  };

  const plans = [
    {
      id: "free",
      name: "Free Tier",
      display: "$0",
      original: null,
      discount: "3 days",
      questions: 5,
      durationText: "3-day access",
      features: [
        "5 questions",
        "Save page access",
        "Print page access",
      ],
    },
    {
      id: "members",
      name: "Members Tier",
      display: paidPlansById.members?.display || "$39.00",
      original: paidPlansById.members?.original || "$49.00",
      discount: "20% off (Save $10.00)",
      questions: paidPlansById.members?.questions || 50,
      questionSummary: "50 questions",
      durationText: "billed monthly",
      features: [
        "50 questions",
        "Print page access",
        "Save page access",
        "Grade page access",
        "Rated page access",
        "Average page access",
      ],
    },
    {
      id: "pro",
      name: "Pro Tier",
      display: paidPlansById.pro?.display || "$436.00",
      original: paidPlansById.pro?.original || "$675.00",
      discount: "35% off (Save $235.00)",
      questions: paidPlansById.pro?.questions || 75,
      questionSummary: "75 questions",
      durationText: "billed yearly",
      features: [
        "75 questions",
        "Print page access",
        "Save page access",
        "Grade page access",
        "Rated page access",
        "Average page access",
      ],
    },
    {
      id: "bonus",
      name: "Bonus Questions",
      display: paidPlansById.bonus?.display || "$100.00",
      original: null,
      discount: null,
      questions: paidPlansById.bonus?.questions || 100,
      questionSummary: "+100 questions",
      durationText: "one-time add-on",
      features: [
        "+100 questions",
        "Stacks on Members or Pro",
        "Never expires",
      ],
    },
  ];

  return (
    <div className="pricing-section">
      <h2>Simple, Straightforward Pricing</h2>
      <p className="subtitle">
        Members bills monthly, Pro bills yearly. Cancel any time.
      </p>

      <div className="pricing-trustbar">
        <span><CreditCard size={16} /> Cancel any time</span>
        <span><RotateCcw size={16} /> 7-day refund guarantee</span>
        <span><ShieldCheck size={16} /> Secure checkout via PayPal</span>
      </div>

      {loading && <p className="subtitle" role="status">Checking PayPal availability…</p>}
      {!checkoutAvailable && !loading && (
        <p className="subtitle" role="status">
          PayPal checkout is not configured yet. You can still start free.
        </p>
      )}

      {message && (
        <div
          className="alert alert-warning"
          style={{ maxWidth: "600px", margin: "0 auto 1.5rem" }}
        >
          {message}
        </div>
      )}

      <div className="pricing-grid">
        {plans
          .filter((plan) => plan.id !== "bonus" || currentTier === "members" || currentTier === "pro")
          .map((plan, idx) => {
          const PlanIcon = PLAN_ICONS[plan.id];
          return (
            <div
              key={plan.id}
              className={`pricing-card${idx === 1 ? " featured" : ""}`}
            >
              {idx === 1 && (
                <div className="pricing-badge">
                  <Crown size={13} /> Most Popular
                </div>
              )}
              <div className="pricing-icon"><PlanIcon size={22} /></div>
              <h3>{plan.name}</h3>
              <div className="pricing-price-row">
                <span className="pricing-price">{plan.display}</span>
                {plan.original && (
                  <>
                    <span className="pricing-original">{plan.original}</span>
                    <span className="pricing-discount">{plan.discount}</span>
                  </>
                )}
              </div>
              <p className="pricing-summary">
                {plan.id === "free" ? `${plan.questions} questions` : plan.questionSummary} • {plan.durationText}
              </p>

              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f}><Check size={15} className="pricing-check" /> {f}</li>
                ))}
              </ul>

              <div className="pricing-action">{planAction(plan)}</div>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="pricing-faq">
        <h3>Frequently Asked Questions</h3>
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div key={faq.q} className={`faq-item${isOpen ? " open" : ""}`}>
              <button
                type="button"
                className="faq-question"
                onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              {isOpen && <p className="faq-answer">{faq.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
