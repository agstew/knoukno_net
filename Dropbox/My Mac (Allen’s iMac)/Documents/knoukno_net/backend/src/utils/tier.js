const TIER_RULES = {
  free: {
    questions: 5,
    duration: "3 days",
    price: 0,
    bonus: 0
  },
  member: {
    questions: 50,
    duration: "1 month",
    price: 49,
    discountedPrice: 39,
    discount: "20%",
    bonusPack: 150,
    bonusPackPrice: 100
  },
  pro: {
    questions: 75,
    duration: "1 year",
    price: 675,
    discountedPrice: 436,
    discount: "35%",
    bonusPack: 175,
    bonusPackPrice: 100
  }
};

function normalizeTier(tier) {
  const value = (tier || "").toLowerCase();
  if (value === "member" || value === "pro") {
    return value;
  }

  return "free";
}

function getQuestionAllowanceForUser(user) {
  const tier = normalizeTier(user?.tier);
  const base = Number(TIER_RULES[tier]?.questions || 0);
  const bonus = Math.max(0, Number(user?.bonusQuestions || 0));
  return base + bonus;
}

function getRemainingQuestionQuota(user, usedCount) {
  return Math.max(0, getQuestionAllowanceForUser(user) - Number(usedCount || 0));
}

module.exports = {
  TIER_RULES,
  normalizeTier,
  getQuestionAllowanceForUser,
  getRemainingQuestionQuota
};
