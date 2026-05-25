"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");

  async function loadDashboard() {
    const nextData = await apiRequest("/dashboard/me");
    setData(nextData);
    localStorage.setItem("knoukno_user", JSON.stringify(nextData.user));
  }

  useEffect(() => {
    loadDashboard().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("token") || searchParams.get("orderId");
    const payerCanceled = searchParams.get("cancel") || searchParams.get("canceled");

    if (payerCanceled) {
      setPaymentMessage("Payment was canceled before capture.");
      return;
    }

    if (!orderId) {
      return;
    }

    apiRequest("/payments/capture-order", {
      method: "POST",
      body: JSON.stringify({ orderId })
    })
      .then(async () => {
        setPaymentMessage("Payment captured successfully. Quota updated.");
        await loadDashboard();
      })
      .catch((err) => setPaymentMessage(err.message));
  }, [searchParams]);

  if (error) {
    return <div className="alert alert-warning">{error}</div>;
  }

  if (!data) {
    return <div className="info-card">Loading dashboard...</div>;
  }

  return (
    <section className="info-card mb-4">
      <h3>Dashboard</h3>
      {paymentMessage ? <div className="alert alert-info py-2">{paymentMessage}</div> : null}
      <p className="mb-1">Email: {data.user.email}</p>
      <p className="mb-1">Tier: {data.user.tier}</p>
      <p className="mb-1">Bonus Questions: {data.user.bonusQuestions || 0}</p>
      <p className="mb-1">Questions used: {data.usage.questions}</p>
      <p className="mb-1">Question allowance: {data.quota?.allowance ?? 0}</p>
      <p className="mb-1">Questions remaining: {data.quota?.remaining ?? 0}</p>
      <p className="mb-0">Admin Email: {data.adminEmail}</p>
    </section>
  );
}
