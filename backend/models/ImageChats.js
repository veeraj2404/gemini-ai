const mongoose = require('mongoose');
const Image = require('./Image').schema;

// Chat Schema
const imageChatSchema = new mongoose.Schema({
  history: [
    {
      role: {
        type: String,
        required: true,
        enum: ['user', 'model']
      },
      parts: [
        {
          image: {
            type: Image,
            required: false,
          },
          text: {
            type: String,
            required: false,
          },
        }
      ]
    }
  ],
  email: {
    type: String,
    required: true,
  },
  imageSessionId: {
    type: Number,
    required: true,
  },
  imageSessionName: {
    type: String,
    required: true,
  },
  priority: {
    type: Boolean,
  },
});

// Custom validation for parts
imageChatSchema.path('history').validate(function (value) {
  return value.every((item) =>
    item.parts.every((part) => part.image || part.text) // Ensure at least one field is present
  );
}, 'Each part must have either an image or text.');

// Create Chat Model
const ImageChat = mongoose.model('ImageChat', imageChatSchema);

module.exports = ImageChat;
