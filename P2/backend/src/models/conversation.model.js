const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }], // [eleve/parent, repetiteur]
  lastMessage:  { type: String },
  lastMessageAt:{ type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
