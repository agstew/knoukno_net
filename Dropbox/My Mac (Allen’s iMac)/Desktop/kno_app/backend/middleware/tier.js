const User = require('../models/User');

async function refreshTier(user){
  const now = new Date();
  let changed = false;
  if (!user.tierExpires || user.tier === 'free') return user;
  if (user.tierExpires && user.tierExpires < now) {
    user.tier = 'free';
    user.questionsRemaining = 5;
    user.tierExpires = new Date(now.getTime() + 3*24*3600*1000);
    changed = true;
  }
  if (changed) await user.save();
  return user;
}

// Middleware to check if user may view questions
async function checkQuestionAccess(req, res, next){
  try{
    const user = await User.findById(req.user.id);
    if (!user) return res.redirect('/auth/login');
    await refreshTier(user);
    if ((user.questionsRemaining || 0) <= 0) {
      return res.render('pricing', { error: 'You have no remaining questions. Please upgrade.' });
    }
    req.currentUser = user;
    return next();
  }catch(err){
    console.error('tier.checkQuestionAccess error', err);
    return res.status(500).send('Server error');
  }
}

// Middleware to consume one question when answering/saving
async function consumeQuestion(req, res, next){
  try{
    const user = req.currentUser || await User.findById(req.user.id);
    await refreshTier(user);
    if ((user.questionsRemaining || 0) <= 0) {
      return res.render('pricing', { error: 'You have no remaining questions. Please upgrade.' });
    }
    user.questionsRemaining = Math.max(0, (user.questionsRemaining || 0) - 1);
    await user.save();
    req.currentUser = user;
    return next();
  }catch(err){
    console.error('tier.consumeQuestion error', err);
    return res.status(500).send('Server error');
  }
}

// Middleware factory for feature gating: features require members or pro
function requireFeature(minTier){
  return async function(req, res, next){
    try{
      const user = req.currentUser || await User.findById(req.user.id);
      await refreshTier(user);
      const tiers = ['free','members','pro'];
      if (tiers.indexOf(user.tier) < tiers.indexOf(minTier)){
        return res.render('pricing', { error: 'Feature requires upgrade to ' + minTier });
      }
      req.currentUser = user;
      return next();
    }catch(err){
      console.error('tier.requireFeature error', err);
      return res.status(500).send('Server error');
    }
  }
}

module.exports = { checkQuestionAccess, consumeQuestion, requireFeature };
