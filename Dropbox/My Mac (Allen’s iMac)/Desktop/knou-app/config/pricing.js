module.exports = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    questionsCount: 5,
    durationDays: 3,
    bonus: null
  },
  members: {
    id: 'members',
    name: 'Members',
    price: 39.00,
    questionsCount: 50,
    durationDays: 30,
    discountPercent: 20
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 675.00,
    questionsCount: 75,
    durationDays: 365,
    discountPercent: 35
  },
  bonus100: {
    id: 'bonus100',
    name: 'Bonus 100 Questions',
    price: 100.00,
    questionsCount: 100,
    durationDays: null
  }
};
