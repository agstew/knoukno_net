"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

const tiers = [
  {
    code: "free",
    name: "Free Tier",
    price: "$0 (3 days)",
    points: ["5 questions", "Title + answers + save + print", "No bonus"]
  },
  {
    code: "member",
    name: "Tier Member 1",
    price: "$49.00 -> $39.00",
    points: ["50 questions / month", "Grade + rate + average", "Bonus pack 150 for $100.00"]
  },
  {
    code: "pro",
    name: "Tier Pro 1",
    price: "$675.00 -> $436.00",
    points: ["75 questions / year", "Grade + rate + average", "Bonus pack 175 for $100.00"]
  }
];

export default function PriceCard() {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState("");
  const [message, setMessage] = useState("");

  const user = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = localStorage.getItem("knoukno_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  async function startPurchase({ tier, purchaseType }) {
    const token = localStorage.getItem("knoukno_token");

    if (!token) {
      router.push("/register");
      return;
    }

    const key = `${purchaseType}-${tier}`;
    setBusyKey(key);
    setMessage("Creating order...");

    try {
      const data = await apiRequest("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ tier, purchaseType })
      });

      const approveLink = data.order?.links?.find((link) => link.rel === "approve")?.href;

      if (!approveLink) {
        throw new Error("Approval link not returned by payment API.");
      }

      setMessage("Order created. Redirecting to payment approval...");
      window.location.href = approveLink;
    } catch (error) {
      setMessage(error.message || "Payment setup failed.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <>
      <section className="tier-grid mb-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="tier-card">
            <span className="badge badge-gold rounded-pill mb-2">{tier.name}</span>
            <h4>{tier.price}</h4>
            <ul>
              {tier.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            {tier.code === "free" ? (
              <button className="btn btn-outline-primary w-100" onClick={() => router.push("/register")}>
                Start Free
              </button>
            ) : (
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => startPurchase({ tier: tier.code, purchaseType: "subscription" })}
                  disabled={Boolean(busyKey)}
                >
                  {busyKey === `subscription-${tier.code}` ? "Working..." : "Buy Now"}
                </button>
                <button
                  className="btn btn-warning"
                  onClick={() => startPurchase({ tier: tier.code, purchaseType: "bonus" })}
                  disabled={Boolean(busyKey) || !user || user.tier !== tier.code}
                  title={
                    !user
                      ? "Login required"
                      : user.tier !== tier.code
                        ? `Bonus requires active ${tier.code} tier`
                        : "Buy bonus pack"
                  }
                >
                  {busyKey === `bonus-${tier.code}` ? "Working..." : "Buy Bonus $100"}
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
      {message ? <p className="mb-0 small">{message}</p> : null}
    </>
  );
}
