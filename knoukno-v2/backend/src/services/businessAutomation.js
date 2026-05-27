const sectors = [
  'industrial services',
  'trade contracting',
  'wholesale supply',
  'retail sales',
  'field services',
  'light manufacturing',
  'construction operations',
  'home improvement',
  'business consulting',
  'digital commerce',
];

const focusAreas = [
  'offer design',
  'customer targeting',
  'pricing',
  'sales process',
  'operations',
  'staffing',
  'cash flow',
  'compliance',
  'marketing',
  'growth planning',
];

const stagePrompts = [
  {
    code: 'start',
    prefix: 'What should you decide first',
    suffix: 'so the business can launch with a clear first move?',
  },
  {
    code: 'build',
    prefix: 'What system should you build next',
    suffix: 'so the business can operate reliably for the next 90 days?',
  },
  {
    code: 'forward',
    prefix: 'What should you improve now',
    suffix: 'so the business keeps growing without losing margin or trust?',
  },
];

function buildBusinessQuestionCatalog() {
  const items = [];
  let sequence = 1;

  for (const sector of sectors) {
    for (const focus of focusAreas) {
      for (const stage of stagePrompts) {
        items.push({
          sequence,
          sector,
          focus,
          stage: stage.code,
          title: `${sector} ${focus}`,
          question: `${stage.prefix} in ${sector} around ${focus} ${stage.suffix}`,
        });
        sequence += 1;
      }
    }
  }

  return items;
}

function buildAdminDailyEmails(user, adminRecipient) {
  const items = [];
  const start = new Date();

  for (let day = 0; day < 730; day += 1) {
    const scheduledFor = new Date(start);
    scheduledFor.setDate(start.getDate() + day);

    items.push({
      title: 'admin-daily-ai',
      value: adminRecipient,
      status: 'scheduled',
      payload: {
        audience: 'admin',
        sourceUserPublicId: user.publicId,
        dayIndex: day + 1,
        to: adminRecipient,
        subject: `Daily business follow-up for ${user.name} day ${day + 1}`,
        body: `Review ${user.name}'s startup progress today. Focus on pipeline quality, next revenue steps, operating gaps, and what should move the business forward tomorrow.`,
        scheduledFor: scheduledFor.toISOString(),
      },
    });
  }

  return items;
}

function buildUserJourneyEmails(user) {
  const items = [];
  const start = new Date();

  for (let week = 0; week < 104; week += 1) {
    const scheduledFor = new Date(start);
    scheduledFor.setDate(start.getDate() + week * 7);

    items.push({
      title: 'user-growth-ai',
      value: user.email,
      status: 'scheduled',
      payload: {
        audience: 'user',
        sourceUserPublicId: user.publicId,
        weekIndex: week + 1,
        to: user.email,
        subject: `Weekly business step ${week + 1} for ${user.name}`,
        body: `This week, tighten one customer problem, one sales action, one delivery system, and one cash decision so your business keeps moving forward with focus.`,
        scheduledFor: scheduledFor.toISOString(),
      },
    });
  }

  return items;
}

module.exports = {
  buildBusinessQuestionCatalog,
  buildAdminDailyEmails,
  buildUserJourneyEmails,
};
