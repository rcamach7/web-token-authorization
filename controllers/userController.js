const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.log_in_post = [
  passport.authenticate("local", {
    failureMessage: true,
    session: false,
  }),
  (req, res, next) => {
    // Create our token and send back to the user (client must save this token)
    jwt.sign(
      { username: req.user.username, password: req.user.password },
      "tomato",
      (err, token) => {
        if (err) next(err);

        res.json({ token });
      }
    );
  },
];

exports.sign_up_post = (req, res, next) => {
  // Process user sign up - note we did not do any sanitation
  bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
    if (err) next(err);

    const user = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    user.save((err) => {
      if (err) next(err);

      res.json(user);
    });
  });
};

// Since we aren't saving users in session anymore, we will authenticate via token we previously sent on log in.
// It is the clients responsibility to save the token in the header, and send it back through every request.
exports.protected_get = [
  (req, res, next) => {
    // Pull the bearerHeader
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      const bearerToken = bearer[1];
      req.token = bearerToken;
      next();
    } else {
      res.status(403).json({
        message: "Protected route - not authorized",
      });
    }
  },
  (req, res, next) => {
    jwt.verify(req.token, "tomato", (err, authData) => {
      if (err) {
        res.status(403).json({ msg: "Failed authentication" });
      } else {
        // Only gets hit if user is authorized
        res.json({ msg: "Accessed protected route - success", authData });
      }
    });
  },
];
