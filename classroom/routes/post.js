const express = require("express");
const router = express.Router();

router.get("/posts", (req, res) => {
  res.send("Message from server");
});

router.get("/posts/show", (req, res) => {
  res.send("Show page:post");
});

module.exports = router;
