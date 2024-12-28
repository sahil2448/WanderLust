const express = require("express");
const app = express();
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { listingSchema, reviewSchema } = require("./schema.js");

const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
  .then((res) => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("err");
  });
async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("I am a root");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((e) => e.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// INDEX ROUTE
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index", { allListings });
});

// New route:
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// adding to the database: CREATE ROUTE
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    let { title, description, image, price, country, location } = req.body;
    let newL = new Listing({
      title: title,
      description: description,
      image: image,
      price: price,
      country: country,
      location: location,
    });
    await newL.save();
    res.redirect("/listings");
  })
);

// SHOW ROUTE
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  // console.log(listing);
  res.render("listings/show.ejs", { listing });
});

// Edit ROUTE
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/edit", { listing });
});

// UPDATE ROUTE:
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let update = req.body;
  await Listing.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  res.redirect(`/listings/${id}`);
});

// DESTROY ROUTE:
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  // let update = req.body;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
});

//Reviews
// Post review Route

app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new Review saved");
    res.redirect(`/listings/${listing._id}`);
  })
);

// delete review route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

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
