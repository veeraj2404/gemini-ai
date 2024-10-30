const mongoose = require('mongoose');

// Chat Schema
const chatSchema = new mongoose.Schema({
  chat: [
    {
      sender: {
        type: String,
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
    }
  ],
  email: {
    type: String,
    required: true,
  },
  sessionId: {
    type: Number,
    required: true,
  },
  sessionName: {
    type: String,
    required: true,
  },
});

// Create Chat Model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
