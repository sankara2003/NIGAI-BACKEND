const mongoose = require('mongoose');

// Define the Counter Schema to handle sequential member IDs
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true }
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
