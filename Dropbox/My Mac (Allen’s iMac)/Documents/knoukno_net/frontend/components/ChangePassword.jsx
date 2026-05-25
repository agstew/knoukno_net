"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function ChangePassword() {
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (form.newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    setBusy(true);
    setMessage("Updating password...");

    try {
      const data = await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        })
      });

      document.cookie = `knoukno_force_change=0; path=/; max-age=${7 * 24 * 60 * 60}`;

      const currentUserRaw = localStorage.getItem("knoukno_user");
      if (currentUserRaw) {
        const currentUser = JSON.parse(currentUserRaw);
        localStorage.setItem(
          "knoukno_user",
          JSON.stringify({ ...currentUser, requirePasswordChange: false })
        );
      }

      setMessage(data.message || "Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      router.push("/dashboard");
    } catch (error) {
      setMessage(error.message || "Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="info-card mb-4">
      <h3>Change Password</h3>
      <p>Replace your temporary password with a secure one.</p>
      <form onSubmit={submit} className="d-grid gap-2">
        <input
          className="form-control"
          type="password"
          placeholder="Current Password"
          value={form.currentPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
          required
        />
        <input
          className="form-control"
          type="password"
          placeholder="New Password (8+ characters)"
          value={form.newPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
          required
        />
        <input
          className="form-control"
          type="password"
          placeholder="Confirm New Password"
          value={form.confirmPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving..." : "Update Password"}
        </button>
      </form>
      {message ? <p className="mt-2 mb-0">{message}</p> : null}
    </section>
  );
}
