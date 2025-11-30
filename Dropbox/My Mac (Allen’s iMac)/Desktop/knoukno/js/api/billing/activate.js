// Simulated Checkout (for testing paywall)
// POST /api/billing/checkout

app.post("/api/billing/checkout", requireAuth, (req, res) => {
  const u = USERS.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ error: "User not found" });

  // pretend to charge the card...
  console.log(`💳 Simulated payment for ${u.email}`);

  // mark as paid and issue a new token
  u.paid = true;
  const token = jwt.sign(
    { id: u.id, email: u.email, name: u.name, paid: u.paid },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    ok: true,
    message: "Payment successful — account activated!",
    token,
  });
});
