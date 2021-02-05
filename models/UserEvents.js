const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const userEventsSchema = new Schema(
  {
    id: String,
    calendarId: String,
    category: String,
    location: String,
    title: String,
    start: String,
    end: String,
    userId: {
      type: Types.ObjectId,
      ref: "users",
      index: true,
    },
  },
  { versionKey: false }
);

mongoose.model("user_calendar_events", userEventsSchema);
