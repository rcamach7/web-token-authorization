const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const userRoutes = require("./routes/userRoutes");
const User = require("./models/User");

// Initiate our application
const app = express();

// Global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// Database Set up
const mongoDB = process.env.MONGO_DB;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

// Set up local strategy for our authentication (passport.authentication() uses these settings)
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      // Error occurred in our search
      if (err) return done(err);

      // Validates username
      if (!user) {
        return done(null, false);
      }

      // Validates password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // Password authenticated
          return done(null, user);
        } else {
          // passwords do not match
          return done(null, false);
        }
      });

      return done(null, user);
    });
  })
);

// Define Routes
app.use("/", userRoutes);

module.exports = app;
