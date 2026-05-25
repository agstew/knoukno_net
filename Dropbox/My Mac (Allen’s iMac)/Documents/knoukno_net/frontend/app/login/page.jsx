"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Title from "@/components/Title";
import { apiRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("Working...");

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });

      localStorage.setItem("knoukno_token", result.token);
      document.cookie = `knoukno_token=${result.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
      document.cookie = `knoukno_force_change=${result.user.requirePasswordChange ? "1" : "0"}; path=/; max-age=${7 * 24 * 60 * 60}`;
      localStorage.setItem("knoukno_user", JSON.stringify(result.user));
      setMessage("Login success.");
      router.push(result.user.requirePasswordChange ? "/change-password" : "/dashboard");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="info-card">
      <Title text="Login" />
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
          placeholder="Password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn btn-primary" type="submit">
          Login
        </button>
      </form>
      <p className="mt-2 mb-0">{message}</p>
    </section>
  );
}
