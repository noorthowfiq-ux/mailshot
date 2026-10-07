const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({
  email: String,
  status: { type: String, enum: ['queued', 'sent', 'failed'], default: 'queued' },
  error: String,
  previewUrl: String,
  sentAt: Date,
}, { _id: false });

const campaignSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  body: { type: String, required: true },
  recipients: [recipientSchema],
  status: { type: String, enum: ['sending', 'sent', 'partial', 'failed'], default: 'sending' },
  totalCount: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);