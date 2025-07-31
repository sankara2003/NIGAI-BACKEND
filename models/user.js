const mongoose = require('mongoose');
const Counter = require('./counter'); // Import the Counter model

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  memberId: { type: String, unique: true },
});

userSchema.pre('save', async function(next) {
  if (!this.memberId) {
    // Get the current counter for 'memberId'
    const counter = await Counter.findOneAndUpdate(
      { name: 'userMemberId' },  // The counter name to use
      { $inc: { value: 1 } },    // Increment the value by 1
      { new: true, upsert: true }  // Create the counter if it doesn't exist
    );
    
    const newMemberId = `NIGAI${String(counter.value).padStart(3, '0')}`;
    this.memberId = newMemberId;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);

