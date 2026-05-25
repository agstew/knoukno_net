"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import { apiRequest } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", tier: "free" });
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("Working...");

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });

      localStorage.setItem("knoukno_token", result.token);
      document.cookie = `knoukno_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `knoukno_force_change=${result.user.requirePasswordChange ? "1" : "0"}; path=/; max-age=${7 * 24 * 60 * 60}`;
      localStorage.setItem("knoukno_user", JSON.stringify(result.user));
      setMessage("Register success.");
      router.push(result.user.requirePasswordChange ? "/change-password" : "/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="info-card">
      <Title text="Register" />
      <form onSubmit={submit} className="d-grid gap-2">
        <input
          className="form-control"
          placeholder="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="form-control"
          placeholder="Password (8+ chars)"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <select
          className="form-select"
          value={form.tier}
          onChange={(e) => setForm({ ...form, tier: e.target.value })}
        >
          <option value="free">Free (5 questions / 3 days)</option>
          <option value="member">Member (50 questions / month)</option>
          <option value="pro">Pro (75 questions / year)</option>
        </select>
        <button className="btn btn-primary" type="submit">
          Register
        </button>
      </form>
      <p className="mt-2 mb-0">{message}</p>
    </section>
  );
}
