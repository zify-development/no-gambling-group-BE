const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const userNewsSchema = new Schema(
  {
    newsDescription: String,
    createdDateNews: Date,
    authorNews: String,
    userId: {
      type: Types.ObjectId,
      ref: "users",
      index: true,
    },
  },
  { versionKey: false }
);

mongoose.model("user_news", userNewsSchema);
