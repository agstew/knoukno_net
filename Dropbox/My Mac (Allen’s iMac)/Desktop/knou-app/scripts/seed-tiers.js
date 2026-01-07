require('dotenv').config();
const mongoose = require('mongoose');
const Tier = require('../models/Tier');
const pricing = require('../config/pricing');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/knoukno';
const force = process.argv.includes('--force');

async function main(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  for(const key of Object.keys(pricing)){
    const p = pricing[key];
    let tier = await Tier.findOne({ name: p.name });
    if (!tier){
      tier = new Tier({
        name: p.name,
        price: p.price || 0,
        questionsCount: p.questionsCount || 0,
        durationDays: p.durationDays || null,
        discountPercent: p.discountPercent || 0,
        bonus: p.bonus || null
      });
      await tier.save();
      console.log(`Created tier ${p.name} (${tier._id})`);
    } else {
      let updated = false;
      if (force || tier.price !== p.price){ tier.price = p.price; updated = true; }
      if (force || tier.questionsCount !== (p.questionsCount || 0)){ tier.questionsCount = p.questionsCount || 0; updated = true; }
      if (force || tier.durationDays !== (p.durationDays || null)){ tier.durationDays = p.durationDays || null; updated = true; }
      if (force || tier.discountPercent !== (p.discountPercent || 0)){ tier.discountPercent = p.discountPercent || 0; updated = true; }
      if (force && p.bonus){ tier.bonus = p.bonus; updated = true; }
      if (updated){ await tier.save(); console.log(`Updated tier ${p.name}`); }
      else console.log(`Tier ${p.name} exists`);
    }
  }

  await mongoose.disconnect();
  console.log('Done seeding tiers.');
}

main().catch(err => { console.error('Seed tiers failed', err); process.exit(1); });
