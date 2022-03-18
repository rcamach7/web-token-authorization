const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

router.get("/", (req, res) => {
  req.json({
    msg: "Hello API",
  });
});

router.post("/log-in", userController.log_in_post);

router.post("/sign-up", userController.sign_up_post);

router.post("/protected", userController.protected_get);

module.exports = router;
