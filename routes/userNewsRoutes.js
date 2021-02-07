const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserNews = mongoose.model("user_news");

const TOKEN_SECRET = "icoders_secret";

const verifyToken = (token) => {
  return jwt.verify(token, TOKEN_SECRET);
};

module.exports = (app) => {
  // endpoint for get user news by id
  app.get(`/api/userNews`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const userNews = await UserNews.find({ userId: decoded.id }).lean();

        return res.status(200).send(userNews);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for get users news by id
  app.get(`/api/usersNews`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const usersNews = await UserNews.find().lean();

        return res.status(200).send(usersNews);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for create user news by id
  app.post(`/api/userNews`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const reqBody = {
          ...req.body,
          id: decoded.id,
        };
        const newUserNews = await UserNews.create(reqBody);
        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Úspěšně uloženo",
          },
          newUserNews,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for update user news by id
  app.put(`/api/userNews`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        await UserNews.updateOne({ id: decoded.id }, req.body);
        const userNews = await UserNews.findOne({ id: decoded.id });

        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Změna byla úspěná",
          },
          userNews,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });
};
