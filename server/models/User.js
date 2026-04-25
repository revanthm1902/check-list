const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isPro: { 
    type: Boolean, 
    default: false // Upgrades to true when Razorpay payment succeeds
  },
  mfaEnabled: { 
    type: Boolean, 
    default: false 
  },
  mfaSecret: { 
    type: String 
  }
}, { timestamps: true });

// The "Vault" Logic: Auto-hash password before saving to DB
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // 12 salt rounds is the current industry standard for bcrypt
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper method to check passwords during login later
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);