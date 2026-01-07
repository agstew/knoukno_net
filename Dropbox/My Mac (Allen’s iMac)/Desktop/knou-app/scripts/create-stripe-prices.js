require('dotenv').config();
const Stripe = require('stripe');
const mongoose = require('mongoose');
const Tier = require('../models/Tier');
const pricing = require('../config/pricing');

const stripeSecret = process.env.STRIPE_SECRET;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/knoukno';
const force = process.argv.includes('--force');

async function main(){
  if (!stripeSecret){
    console.error('STRIPE_SECRET not set. Set it in environment or .env and retry.');
    process.exit(2);
  }
  const stripe = Stripe(stripeSecret);
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  for(const key of Object.keys(pricing)){
    const p = pricing[key];
    console.log(`Processing tier: ${p.name} ($${p.price})`);

    let tier = await Tier.findOne({ name: p.name });
    if (!tier){
      tier = new Tier({ name: p.name, price: p.price, questionsCount: p.questionsCount || 0, durationDays: p.durationDays || null, discountPercent: p.discountPercent || 0, bonus: p.bonus || null });
      await tier.save();
      console.log(`  Created Tier document ${tier._id}`);
    }

    if (tier.stripePriceId && !force){
      console.log(`  Already has stripePriceId ${tier.stripePriceId} — skipping`);
      continue;
    }

    if (!p.price || p.price === 0){
      console.log('  Price is $0 — not creating Stripe price; leaving stripePriceId blank.');
      continue;
    }

    // Create product
    const product = await stripe.products.create({ name: p.name, metadata: { tierId: p.id || key } });
    console.log(`  Created product ${product.id}`);

    const amount = Math.round(p.price * 100);
    const recurring = p.durationDays && p.durationDays >= 30;
    const priceParams = { unit_amount: amount, currency: 'usd', product: product.id };
    if (recurring) priceParams.recurring = { interval: p.durationDays >= 365 ? 'year' : 'month' };

    const price = await stripe.prices.create(priceParams);
    console.log(`  Created price ${price.id}`);

    tier.stripePriceId = price.id;
    await tier.save();
    console.log(`  Updated Tier ${tier._id} stripePriceId=${price.id}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error('Error creating Stripe prices', err);
  process.exit(1);
});
