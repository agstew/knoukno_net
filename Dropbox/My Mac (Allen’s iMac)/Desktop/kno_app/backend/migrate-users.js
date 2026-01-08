const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/kno';
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => migrate())
  .catch(err => console.error(err));

async function migrate(){
  console.log('Migrating users to add membership fields...');
  const users = await User.find({});
  for(const u of users){
    let changed = false;
    if (!u.tier){ u.tier = 'free'; changed = true; }
    if (!u.questionsRemaining && u.questionsRemaining !== 0){ u.questionsRemaining = 5; changed = true; }
    if (!u.tierExpires){ u.tierExpires = new Date(Date.now() + 3*24*3600*1000); changed = true; }
    if (changed) await u.save();
  }
  console.log('Migration complete.');
  process.exit(0);
}
