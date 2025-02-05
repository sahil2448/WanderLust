if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const cookieParser = require("cookie-parser");

const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const listingRouter = require("./routes/listing.js");
const Listing = require("./models/listing");

const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // creates a mongoStore for us

const flash = require("connect-flash");
const { cookie } = require("express/lib/response.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
main()
  .then((res) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });
async function main() {
  // await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbUrl, // ATLAS
  crypto: {
    // secret: "mysupersecretcode",
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600, // seconds
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store, // ATLAS
  // secret: "mysupersecretcode",
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// initialize the passport using middleware:
app.use(passport.initialize());
app.use(passport.session());

//// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
//authenticate() Generates a function that is used in Passport's LocalStrategy

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// serializeUser() Generates a function that is used by Passport to serialize users into the session
// deserializeUser() Generates a function that is used by Passport to deserialize users into the session

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});
// cookie-parser:
app.use(cookieParser("secretcode"));

// app.get("/getsignedcookie", (req, res) => {
//   res.cookie("made-in", "India", { signed: true });
//   res.send("Signed cookie sent");
// });

// app.get("/verify", (req, res) => {
//   console.log(req.signedCookies);
//   console.log(req.cookies); // unsigned cookie
//   res.send("Verified");
// });
// SENDING A SAMPLE COOKIE:
// app.get("/getCookie", (req, res) => {
//   res.cookie("greet", "namaste");
//   res.cookie("origin", "india");
//   res.send("I have sent you some cookie....check them out");
// });

// app.get("/", (req, res) => {
//   console.dir(req.cookies);
//   res.send(req.cookies);
//   // res.send("I am a root");
// });

// CREATING A DEMO USER----Authentications:
// app.get("/demoUser", async (req, res) => {
//   let fakeUser = new User({
//     email: "sk@gmail.com",
//     username: "notUser",
//   });

//   let registeredUser = await User.register(fakeUser, "HelloSahil");
//   res.send(registeredUser);
//   // register(user, password, callback) Convenience method to register a new user instance with a given password. Checks if username is unique
// });
// app.get("/", async (req, res) => {
//   res.render("listings/index.js");
// });

app.get("/listings/search", async (req, res) => {
  let destination = req.query.destination.toLowerCase();
  let allListings = await Listing.find({});

  let filteredListings = allListings.filter(
    (list) =>
      list.location.toLowerCase() === destination ||
      list.country.toLowerCase() === destination
  );

  console.log(allListings);

  res.render("listings/index.ejs", {
    destination,
    filteredListings,
    allListings,
  });
});

app.use("/", listingRouter); // coming from routes folder
app.use("/listings/:id/reviews", reviewRouter); // coming from routes folder
app.use("/", userRouter); // coming from routes folder

// IF REQUEST SENT AT PAGE WHICH DOESN'T EXISTS:
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ERROR HANDLING MIDDLEWARE:
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Internal server error" } = err;
  // res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("Server is listening to port:", 8080);
});
