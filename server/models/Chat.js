const mongoose = require("mongoose");

const ChatSchema = mongoose.Schema({
  groupName: {
    type: String,
    required: true,
  },
  messages: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("Chat", ChatSchema);
