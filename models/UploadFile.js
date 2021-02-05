const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const uploadFileSchema = new Schema(
  {
    fileUrl: String,
    fileType: String,
    fileName: String,
    fileSize: Number,
    id: {
      unique: true,
      type: Types.ObjectId,
      ref: "users",
    },
  },
  { versionKey: false }
);

mongoose.model("user_images", uploadFileSchema);
