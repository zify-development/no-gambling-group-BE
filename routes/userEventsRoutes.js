const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserEvents = mongoose.model("user_calendar_events");

const TOKEN_SECRET = "icoders_secret";

const verifyToken = (token) => {
  return jwt.verify(token, TOKEN_SECRET);
};

module.exports = (app) => {
  // endpoint for get user events by id
  app.get(`/api/userEvents`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const userEvents = await UserEvents.find({ userId: decoded.id }).lean();

        return res.status(200).send(userEvents);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for create user event
  app.post(`/api/userEvents`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const reqBody = {
          ...req.body,
          userId: decoded.id,
        };
        const newUserEvent = await UserEvents.create(reqBody);
        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Úspěšně uloženo",
          },
          newUserEvent,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for update user event
  app.put(`/api/userEvents`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        await UserEvents.updateOne({ id: req.body.id }, req.body);
        const userEvents = await UserEvents.findOne({ id: req.body.id });

        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Změna byla úspěná",
          },
          userEvents,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  app.delete(`/api/userEvents/:id`, async (req, res) => {
    const { id } = req.params;

    let userEvents = await UserEvents.findOneAndDelete({ id: id });

    return res.status(202).send({
      error: false,
      userEvents,
    });
  });
};
