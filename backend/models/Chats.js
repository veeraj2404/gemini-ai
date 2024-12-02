const mongoose = require('mongoose');

// Chat Schema
const chatSchema = new mongoose.Schema({
  history: [
    {
      role: {
        type: String,
        required: true,
        enum: ['user', 'model']
      },
      parts: [
        {
          text: {
            type: String,
            required: true
          },
        }
      ],
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
  priority: {
    type: Boolean,
  },
});

// Create Chat Model
const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
