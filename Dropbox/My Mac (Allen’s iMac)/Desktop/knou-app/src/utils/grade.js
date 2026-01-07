function rateToGrade(rate){
  if (typeof rate !== 'number' || rate < 1 || rate > 175) throw new Error('rate must be 1-175');
  const pct = (rate - 1) / 174; // 0..1
  if (pct >= 5/6) return 'A';
  if (pct >= 4/6) return 'B';
  if (pct >= 3/6) return 'C';
  if (pct >= 2/6) return 'D';
  if (pct >= 1/6) return 'F';
  return 'F';
}

function gradeToRange(letter){
  const bands = {
    A: [146,175],
    B: [117,145],
    C: [88,116],
    D: [59,87],
    F: [1,58]
  };
  return bands[letter] || null;
}

module.exports = { rateToGrade, gradeToRange };
