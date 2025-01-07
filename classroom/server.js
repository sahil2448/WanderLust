const express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");

const sessionOptions = {
  secret: "myscretsessionId",
  resave: false,
  saveUninitialized: true,
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("error"); // this messages we can directly access in the page...instead of passing in res.render
  res.locals.errorMsg = req.flash("success"); // this messages we can directly access in the page...instead of passing in res.render
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.get("/testing", (req, res) => {
//   res.send("just a testing");
// });

// app.get("/reqCount", (req, res) => {
//   if (req.session.count) {
//     req.session.count++;
//   } else {
//     req.session.count = 1;
//   }
//   res.send(`You sent a request ${req.session.count} time`);
// });

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  console.log(req.session.name);

  if (name === "anonymous") {
    req.flash("error", "User not registered"); // two arguments are necessary to pass success is the key...to identity which message to pass
  } else {
    req.flash("success", "User registered successfully"); // two arguments are necessary to pass success is the key...to identity which message to pass
  }
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name }); // flash will only render once...
});

app.listen(8080, () => {
  console.log("Server is listening to port no:", 8080);
});
