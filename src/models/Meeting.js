import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },

}, {
  timestamps: true,
});

export default mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);
