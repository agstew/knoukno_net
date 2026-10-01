// One-time script: inserts the welcome email as the very first scheduled send,
// ahead of the 2-year daily campaign, introducing it and offering opt-in/opt-out.
require('dotenv').config();
const mongoose = require('mongoose');
const ScheduledEmail = require('./models/ScheduledEmail');

const message = `Thank you for being part of Kno U Kno.

Starting today, you will receive one short business email per day for the next two years, each one built around a real decision business owners have to make. The topics rotate through five areas every month: Law, Shop, Hired, Customer, and Saving - the same path we walk through in the app itself.

Each email poses one specific, practical question about running a business, the kind of question that is easy to put off but expensive to ignore. There is nothing to buy and nothing to sign up for beyond what you have already done - this is simply a daily nudge to think through one more piece of the business.

You are in control of whether these keep coming. If you want to keep receiving them, you do not need to do anything - they will continue automatically. If you would rather not receive them, you can opt out any time using the link below, and you can opt back in later the same way.

Opt in and keep receiving these: {{OPTIN_LINK}}

Opt out and stop receiving these: {{OPTOUT_LINK}}

We ask the questions. You write the answers, and we keep every one of them so you can come back to any of this later.`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const sendAt = new Date(Date.now() + 2 * 60 * 1000);
  const doc = await ScheduledEmail.create({
    subject: 'Thank You \u2014 about the daily emails you will start getting',
    message,
    sendAt,
    status: 'pending'
  });
  console.log(`Welcome email scheduled for ${doc.sendAt.toISOString()}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Schedule welcome email error:', err);
  process.exit(1);
});
