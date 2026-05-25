import { Suspense } from "react";
import Title from "@/components/Title";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  return (
    <>
      <Title text="Dashboard.jsx" />
      <Suspense fallback={<section className="info-card">Loading dashboard...</section>}>
        <Dashboard />
      </Suspense>
    </>
  );
}
