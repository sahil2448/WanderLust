const express = require("express");
const router = express.Router();

router.get("/users", (req, res) => {
  res.send("Message from server");
});

router.get("/users/show", (req, res) => {
  res.send("Show page:user");
});

module.exports = router;
