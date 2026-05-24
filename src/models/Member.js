import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  
  team: {
    type: String,
    enum: ["Tech", "PR", "Executive", "Research"],
    required: true,
    index: true,
  },
  memberType: {
    type: String,
    enum: ["Head", "General", "Volunteer"],
    required: true,
  },
  skills: {
    type: [{
      type: String,
      enum: ["Designing", "Coding", "Managing", "Researching", "Speaking"]
    }],
    default: [],
  },
  contributionScore: {
    type: Number,
    default: 0,
    index: true,
  },
  rank: {
    type: Number,
    default: 0,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
}, {
  timestamps: { createdAt: 'joinedAt', updatedAt: 'updatedAt' },
});

export default mongoose.models.Member || mongoose.model('Member', memberSchema);
