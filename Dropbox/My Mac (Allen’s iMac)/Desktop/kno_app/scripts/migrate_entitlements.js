#!/usr/bin/env node
// scripts/migrate_entitlements.js
// Scans Entitlement documents with no userId and attempts to link them to User by
// stripe customer id (from entitlement.meta.session.customer) or by email.

const mongoose = require('mongoose');
const Entitlement = require('../models/Entitlement');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

async function run(options = {}) {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kno_app';
  const dry = options.dry || process.argv.includes('--dry') || process.env.DRY_RUN === '1';
  const connectFirst = options.connect !== false;
  if (connectFirst) {
    console.log('Connecting to', uri);
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  console.log('Dry run:', !!dry);

  const cursor = Entitlement.find({ userId: { $exists: false } }).cursor();
  let count = 0;
  let linked = 0;
  for (let ent = await cursor.next(); ent != null; ent = await cursor.next()) {
    count++;
    const email = ent.email;
    const meta = ent.meta || {};
    const session = meta.session || {};
    const candidateCustomer = session.customer || (session.customer_details && session.customer_details.customer) || (session.id ? session.id : undefined);

    let user = null;
    if (candidateCustomer) {
      user = await User.findOne({ stripeCustomerId: candidateCustomer });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (user) {
      console.log(`Ent ${ent._id} -> user ${user._id} (email=${email || 'n/a'} customer=${candidateCustomer || 'n/a'})`);
      if (!dry) {
        ent.userId = user._id;
        await ent.save();
        user.entitlements = user.entitlements || [];
        if (!user.entitlements.find(eid => String(eid) === String(ent._id))) user.entitlements.push(ent._id);
        if (candidateCustomer && !user.stripeCustomerId) user.stripeCustomerId = candidateCustomer;
        await user.save();
      }
      linked++;
    } else {
      console.log(`Ent ${ent._id} no matching user (email=${email || 'n/a'} customer=${candidateCustomer || 'n/a'})`);
    }
  }

  console.log(`Scanned ${count} entitlements, linked ${linked}`);
  if (connectFirst) await mongoose.disconnect();
  return { scanned: count, linked };
}

// Allow running as CLI
if (require.main === module) {
  run().then(res => process.exit(0)).catch(err => { console.error(err); process.exit(2); });
}

module.exports = { run };
