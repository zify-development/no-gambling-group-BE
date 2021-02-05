const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./models/User");
require("./models/UserInfo");
require("./models/UploadFile");
require("./models/UserEvents");

const app = express();

app.use(cors());

mongoose.Promise = global.Promise;
mongoose.connect(
  process.env.MONGODB_URI ||
    `mongodb+srv://admin:majny9561@cluster0.tzzvw.mongodb.net/projectDB?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});

require("./routes/userRoutes")(app);
require("./routes/userInfoRoutes")(app);
require("./routes/uploadFileRoutes")(app);
require("./routes/userEventsRoutes")(app);


if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
