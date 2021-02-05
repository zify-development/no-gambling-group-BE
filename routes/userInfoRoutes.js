const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const UserInfo = mongoose.model("users_profile_datas");
const uploadFile = mongoose.model("user_images");

const TOKEN_SECRET = "icoders_secret";

const verifyToken = (token) => {
  return jwt.verify(token, TOKEN_SECRET);
};

module.exports = (app) => {
  // endpoint for get user info by id
  app.get(`/api/userInfo`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const userInfo = await UserInfo.findOne({ id: decoded.id }).lean();
        const userImage = await uploadFile.findOne({ id: decoded.id });

        const fullUrl = req.protocol + "://" + req.get("host");

        const correctBody = {
          ...userInfo,
          imageUrl: userImage
            ? `${fullUrl}/api/user/image/${userImage._id}`
            : null,
        };

        return res.status(200).send(correctBody);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for create user info by id
  app.post(`/api/userInfo/`, async (req, res) => {
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
        const newUserInfo = await UserInfo.create(reqBody);
        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Úspěšně uloženo",
          },
          newUserInfo,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for update user info by id
  app.put(`/api/userInfo/`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        await UserInfo.updateOne({ id: decoded.id }, req.body);
        const userInfo = await UserInfo.findOne({ id: decoded.id });

        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Změna byla úspěná",
          },
          userInfo,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });
};
