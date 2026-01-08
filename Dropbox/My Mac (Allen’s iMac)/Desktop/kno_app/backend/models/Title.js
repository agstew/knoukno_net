const mongoose = require('mongoose');

const TitleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Title', TitleSchema);
