const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = mongoose.model("users");

const TOKEN_SECRET = "icoders_secret";

const verifyToken = (token) => {
  return jwt.verify(token, TOKEN_SECRET);
};

module.exports = (app) => {
  // endpoint for get user all users
  app.get(`/api/users`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        if (decoded.role === "admin") {
          const users = await User.find({ role: "user" });
          return res.status(200).send(users);
        } else {
          return res.status(403).send("not admin");
        }
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for register user
  app.post("/api/user/register", async (req, res) => {
    const isEmailExist = await User.findOne({ email: req.body.email });
    if (isEmailExist) {
      return res.status(200).send({
        error: true,
        statusMessage: {
          status: 400,
          type: "error",
          message: "Účet s tím emailem již existuje",
        },
      });
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      email: req.body.email,
      password,
      role: "user",
    });
    try {
      const savedUser = await user.save();
      res.json({ error: null, data: savedUser });
    } catch (error) {
      res.status(400).send({ error });
    }
  });

  // endpoint for login user
  app.post("/api/user/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    // throw error when email is wrong
    if (user && user.blocked) {
      return res.status(200).send({
        error: true,
        statusMessage: {
          status: 400,
          type: "error",
          message: "Vaš účet je blokován",
        },
      });
    }
    if (!user)
      return res.status(200).send({
        error: true,
        statusMessage: {
          status: 400,
          type: "error",
          message: "Účet s tím emailem neexistuje",
        },
      });
    // check for password correctness
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(200).send({
        error: true,
        statusMessage: {
          status: 400,
          type: "error",
          message: "Zadali jste špatné heslo",
        },
      });
    // create token
    const token = jwt.sign(
      // payload data
      {
        email: user.email,
        id: user._id,
        role: user.role,
        cretedDate: user.cretedDate,
        password: user.password,
      },
      TOKEN_SECRET
    );

    res.header("auth-token", token).json({
      error: false,
      data: {
        token,
      },
    });
  });

  // endpoint for update user info by id
  app.put(`/api/user/changePassword`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        const validPassword = await bcrypt.compare(
          req.body.oldPassword,
          decoded.password
        );

        if (!validPassword) {
          return res.status(200).send({
            error: true,
            statusMessage: {
              status: 400,
              type: "error",
              message: "Špatné heslo",
            },
          });
        }

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(req.body.newPassword, salt);

        const currentData = {
          ...decoded,
          password: newPassword,
        };

        await User.updateOne({ _id: decoded.id }, currentData);
        const user = await User.findOne({ _id: decoded.id });

        return res.status(200).send({
          error: false,
          statusMessage: {
            type: "success",
            message: "Změna byla úspěná",
          },
          user,
        });
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for get user data by token
  app.get("/api/user", async (req, res) => {
    if (req.headers && req.headers.authorization) {
      var authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];

      try {
        decoded = verifyToken(token);
        return res.status(200).send(decoded);
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // endpoint for update user blocked status with admin
  app.put(`/api/user`, async (req, res) => {
    if (req.headers && req.headers.authorization) {
      let authorization = req.headers.authorization,
        decoded;
      const token = authorization.split(" ")[1];
      try {
        decoded = verifyToken(token);
        if (decoded.role === "admin") {
          await User.updateOne({ _id: req.body._id }, req.body);
          const user = await User.findOne({ _id: req.body._id });

          return res.status(200).send({
            error: false,
            statusMessage: {
              type: "success",
              message: "Změna byla úspěná",
            },
            user,
          });
        }
      } catch (e) {
        return res.status(401).send("unauthorized");
      }
    } else {
      return res.status(500).send("internal server error");
    }
  });

  // app.delete(`/api/user/:id`, async (req, res) => {
  //   const {id} = req.params;

  //   let user = await User.findByIdAndDelete(id);

  //   return res.status(202).send({
  //     error: false,
  //     user
  //   })

  // })
};
